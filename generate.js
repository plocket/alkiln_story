// generate.js

// ============================
// Cut down on unneeded data
// ============================
let keys_to_ignore = [
  '_internal',
  'nav',
  'url_args',
  '_class',
  'auto_gather',
  'instanceName',
  'mimetype',  // Not sure about removing this one
  'multi_user',
  // Less sure these are safe to ignore
  'ask_number',
  'ask_object_type',
  'object_type',
  // 'there_are_any',  // This is a real field
  'gathered',
  // Files
  'file_info',
  'filename',
  'persistent',
  'private',
  'convert_to_pdf_a',
  'convert_to_tagged_pdf',
  'extension',
  'valid_formats',
  'encrypted',
  'has_specific_filename',
  // address
  'geolocate_response',
  'norm_long',
  'city_only',
  'geolocated',
  'orig_address',
  'latitude',
  'longitude',
  'norm',
  'geolocate_success',
];

// Ignore text we should ignore wherever it appears, even in a fully formed variable name
let ignore_anywhere = [
  // AssemblyLine-specific keywords to skip
  'interview_metadata',
  'macourts',
  'court_emails',
];


/*
Before we can continue:
Q1: How do we know if it has a 'choice' name?
We need to iterate all the way in unless we
see a 'choice', in which case the variable name
does not include the choice name and the choice
name is put into its own column. What indicates that?

A1: We might be able to get around that in the testing
framework by using both choice and value to look
for each kind of element.

Q1.5: What about yesno radio values which have "lksjgf": true? Will those pan out if we make all those 'True'?
A1.5: No idea

Q2: How about those strings coming out with quotes around them?
A2: Take care of that in the testing framework too? It's a confusion human might have as well. We can just strip the leading and ending double or single quotes from a value that comes in.

Q2.5: Followup to Q2 - what if the quotes are meant to be there?
A2.5: ~Don't do that?~ nvm, taking care of that in test-generating code.
*/

// DONE? checkbox 'none of the above' doesn't get created when needed.


// ============================
// Building the table
// ============================
let add_story_row = function(name, choice, value, story) {

  // Ignore text we should ignore wherever it appears, even in a fully formed variable name
  if (ignore_anywhere.includes( name )) { return; }
  for ( let to_ignore of ignore_anywhere ) {
    if ( name.includes( to_ignore ) ) { return; }
  }

  if (typeof value === 'string') {
    value = JSON.stringify(value);
    value = value.substring(1, value.length - 1);
    // DONE: Dates are dumb.
    value = value.replace(/(\d\d\d\d)-(\d\d)-(\d\d)T\d\d:\d\d:\d\d-\d\d:\d\d/, '$2/$3/$1');
  }
  let row = `| ${name} | ${choice} | ${value} |`;
  // If it isn't already in the variable table, add it
  if ( story.indexOf( row ) === -1 ){
    story.push( row );
  }
};

// let parse_terminator = function( name, value, story ) {
// }

let parse_arr = function(name, arr, story) {
  for (let index = 0; index < arr.length; index++) {
    let var_name = `${name}[${index}]`;

    let value = arr[index];
    if (typeof value === 'string' || typeof value === 'number') {
      add_story_row( var_name, '', value, story );
    } else if (Array.isArray(value)) {
      parse_arr( var_name, value, story );
    } else if ( typeof value === 'object' ) {
      parse_dict({
        name_start: var_name,
        choice: '',
        dict: value,
        story: story
      });
    } else {
      console.log('Sorry, something has not been accounted for. You will have to do some editing to get this to work. (2)', var_name, typeof value);
    }
  }
}

let add_bool = function(var_name, value, story) {
  // Checkbox yes/no should end in true or false depending on value. Radio doesn't care about value. Radio does care about choice (True or False).
  let str = value.toString()
  let caps = str.charAt(0).toUpperCase() + str.slice(1);
  add_story_row( var_name, caps, str, story );
};

let parse_elements = function(var_name, elements, story) {
  if (Array.isArray(elements)) {
    parse_arr( var_name, elements, story );
  } else {
    let were_checkboxes = false;
    let true_found = false;
    for ( let choice in elements ) {
      let choice_value = elements[ choice ];
      let type = typeof choice_value;
      if (type === 'string' || type === 'number' || type === 'boolean') {
        add_story_row( var_name, choice , choice_value, story );
        if ( type === 'boolean' ) {
          were_checkboxes = true;
        }
        if (choice_value === true) {
          true_found = true;
        }
      } else if ( typeof choice_value === 'object' ) {
        if (keys_to_ignore.includes( var_name )) { continue; }
        if (ignore_anywhere.includes( var_name )) { continue; }
        parse_dict({
          name_start: var_name,
          choice: '',
          dict: choice_value,
          story: story,
        });
      } else {
        console.log('Sorry, something has not been accounted for. You will have to do some editing to get this to work. (1)', var_name, typeof choice_value);
      }
    }  // ends for choice in elements
    // In case all elements were false, we
    if ( were_checkboxes && !true_found ) {
      // choice name is just for comfort here
      add_story_row( var_name, 'None' , true, story );
    }
  }  // ends typeof elements
};

let parse_dict = function({name_start, choice, dict, story}, debug) {
  for ( let key in dict ) {
    if (keys_to_ignore.includes( key )) { continue; }
    // if (ignore_anywhere.includes( key )) { continue; }

    let var_name = key;
    if (name_start !== '') {
      var_name = name_start + '.' + key;
    }
    let value = dict[ key ];

    let val_type = typeof value;
    if (val_type === 'string' || val_type === 'number') {
      add_story_row( var_name, '', value, story );

    } else if (val_type === 'boolean') {
      add_bool(var_name, value, story);

    } else if (Array.isArray(value)) {
      parse_arr( var_name, value, story );

    } else if ( typeof value === 'object' && value !== null ) {
      if ( value.instanceName ) { var_name = value.instanceName }
      let {elements, ...new_dict} = value;
      if (elements) {
        parse_elements( var_name, elements, story );
      }
      // Debugging, so keeping logs clean for now
      parse_dict({
        name_start: var_name,
        choice: '',
        dict: new_dict,
        story: story,
      });
    }
  }
}

let get_story = function( vars, story ) {
  return parse_dict({
    name_start: '',
    choice: '',
    dict: vars,
    story: story,
  });
};  // Ends get_story()



// ============================
// Extra options
// ============================

// let ignore_keys_input = document.getElementById('ignore_keys');
// ignore_keys_input.value = JSON.stringify( keys_to_ignore, null, 2 );


// ============================
// Triggering and getting the result
// ============================

let scenario = document.getElementById('scenario');
let tableInput = document.getElementById('data');
let output = '';
tableInput.addEventListener('input', function() {
  
  let input = tableInput.value || '{}';
  let data = null;
  let vars = null;
  try {
    data = JSON.parse( input );
    vars = data.variables;
  } catch (err) {
    data = toString(err);
  }
  
  if ( typeof data === 'string' ) {
    console.log( data );
    output = `\n\n${ test_start }`;
    output += '\nSee console for output error';
  } else {
    let story = [];
    get_story( vars, story );

    let test_length = `slow`;
    if ( story.length <= 20 ) { test_length = `fast`; }
    output = `\n\n@generated @${ test_length }`;
    output += test_start;

    for ( let row of story ) {
      output += `\n\u00A0\u00A0\u00A0\u00A0${row}`;
    }

  }  // ends if error

  scenario.innerText = output;
});  // ends text area event listener


// ============================
// Copying
// ============================
let copy_scenario_button = document.getElementById('copy_scenario');
copy_scenario_button.addEventListener('click', ( elem ) => {
  navigator.clipboard.writeText( output );
});


let copy_feature_button = document.getElementById('copy_feature');
let feature = document.getElementById('feature');
copy_feature_button.addEventListener('click', ( elem ) => {
  navigator.clipboard.writeText( `${ feature.innerText }\n\n` );
});


// ============================
// Prepping start (and default) text
// ============================
let test_start = `\nScenario: Quick description of specific example`;
test_start += `\n\u00A0\u00A0Given I start the interview at "interview_YAML_file_name"`
test_start += `\n\u00A0\u00A0And the user gets to "some question id" with this data:`
test_start += `\n\u00A0\u00A0\u00A0\u00A0| var | choice | value |`;

scenario.innerText = test_start;
output = `\n\n${ test_start }`;

