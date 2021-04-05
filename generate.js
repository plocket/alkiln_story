// generate.js

// ============================
// Cut down on unneeded data
// ============================
let keys_to_ignore = [
  // Less sure these are safe to ignore
  'ask_number',
  'ask_object_type',
  'object_type',
  'gathered',
];

// Conceptual version
// Ignore text we should ignore wherever it appears, even in a fully formed variable name
let ignore_anywhere_default = [
  // === AssemblyLine-specific keywords to skip
  'interview_metadata',
  'macourts',
  'court_emails',
  '.location',
  'github_repo_name',
  'allow_cron',
  'allowed_courts',
  '.uses_parts',
  `.court_code`,
  `.department`,
  // `.name`, `.phone`, `.description`,
  `.division`,
  `.fax`,
  `.has_po_box`,

  // === da
  '_internal',
  'nav',
  'url_args',
  '_class',
  'auto_gather',
  'instanceName',
  'mimetype',  // Not sure about removing this one
  'multi_user',
  // --- files
  'file_info',
  // 'filename',  // Possibility to identify some signatures
  'persistent',
  'private',
  'convert_to_pdf_a',
  'convert_to_tagged_pdf',
  'extension',
  'valid_formats',
  'encrypted',
  'has_specific_filename',
  // --- address
  'geolocate_response',
  'norm_long',
  'city_only',
  'geolocated',
  'orig_address',
  'latitude',
  'longitude',
  'norm',
  'geolocate_success',
  'complete_attribute',
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


// ============================
// Building the table
// ============================
let get_story_row = function({ name, value, checked }, debug=false) {
  let row;

  // Ignore text we should ignore wherever it appears, even in a fully formed variable name
  if ( ignore_anywhere.includes( name )) { return row; }
  for ( let to_ignore of ignore_anywhere ) {
    if ( name.includes( to_ignore ) ) { return row; }
  }

  if ( typeof value === 'string' ) {
    value = JSON.stringify( value );  // to escape quotes and such?
    value = value.substring(1, value.length - 1);  // get rid of JSON quotes?
    // Dates are dumb.
    value = value.replace(/(\d\d\d\d)-(\d\d)-(\d\d)T\d\d:\d\d:\d\d-\d\d:\d\d/, '$2/$3/$1' );
  }

  // Try to guess signatures
  if ( name.endsWith( `.filename` ) && value === `canvas.png` ) {
    name = name.replace( '.filename', '' );
    value = '/sign';
  }

  row = `| ${ name } | ${ value } | ${ checked } |`;
  row = row.replace(/ /g, '\u00A0');  // Avoid collapsing multiple sapces (darn HTML!)

  return row;
};  // End get_story_row()


// yield. Maybe. Not supported by IE and a bit weird in Node.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield
// creating an array out of some input
// generator function that yields each item
// caller: I invoke a gen func that returns an iterable
// use `for of` on the iterable. composes/symetrical.
// Not using higher order funcs anymore. async and await can be more natural.

let parse = {};

parse.all = function ({name, value, checked }, debug) {
  let all = [];

  for ( let key in value ) {
    if ( keys_to_ignore.includes( key )) { continue; }
    if ( ignore_anywhere_default.includes( key )) { continue; }  // logging everything was annoying

    let var_name = key;
    if (name !== '' ) { var_name = name + '.' + key; }
    let new_value = value[ key ];
    let val_type = typeof new_value;

    let rows = [];
    if ( Array.isArray( new_value )) {
      rows = parse.array({ name: var_name, value: new_value, checked: '', }, debug);

    } else if ( new_value === null ) {
      rows = parse.null({ name: var_name, value: new_value, checked: '', }, debug);

    } else if ( new_value !== null && parse[ val_type ] ) {
      rows = parse[ val_type ]({ name: var_name, value: new_value, checked: '', }, debug);
    
    } else {
      console.warn( 'Sorry, something has not been accounted for. You will have to do some editing to get this to work.', var_name, typeof value);
    }

    all = all.concat( rows );
  }  // ends for key in value

  // Get unique rows that are strings (removing `undefined`)
  let story = [];
  for ( let row of all ) {
    if ( story.indexOf( row ) === -1 && typeof row === 'string' ){
      story.push( row );
    }
  }

  return story;
};  // End parse.all()


parse.elements = function ({ name, value, checked }, debug) {
  let rows = [];

  // If it's a non-array object
  if ( !Array.isArray( value )) {
    // See if we need a 'none of the above' row
    let were_checkboxes = false;
    let any_true = false;
    for ( let element_key in value ) {
      let one_row;
      if ( typeof value[ element_key ] === 'boolean' ) {
        // Can this sometimes be buttons?
        were_checkboxes = true;
        if ( value[ element_key ] === true ) {
          any_true = true;
        }

        // Multi-option checkbox fields are different than others
        let one_row = get_story_row({
          name: name,
          value: element_key,
          checked: value[ element_key ],
        }, debug);
        rows.push( one_row );
      } else {

        // Not sure when this would happen
        rows = rows.concat(parse.all({ name, value, checked }, debug));

      }
    }  // ends for choice in value

    // If all checkboxes were false, we need a 'none of the above' row
    if ( were_checkboxes ) {
      if ( !any_true ) {
        let nota_row = get_story_row({ name: name, value: 'None', checked: true, }, debug );
        rows.push( nota_row );
      } else {
        let nota_row = get_story_row({ name: name, value: 'None', checked: false, }, debug );
        rows.push( nota_row );
      }
    }
  } else {
    rows = rows.concat( parse.all({ name, value, checked }, debug) );
  }

  return rows;
};  // Ends parse.elements()


parse.object = function ({ name, value, checked }, debug) {
  if ( value.instanceName ) { name = value.instanceName; }
  let { elements, ...new_obj } = value;
  if ( elements ) {  // Skip adding `element` to the name
    return parse.elements({ name, value: elements, checked: '', }, debug);
  }
  return parse.all({ name, value: new_obj, checked: '', }, debug);
};  // Ends parse.object()


parse.array = function ({ name, value, checked }, debug ) {
  // When does this happen? I know there are times...
  let rows = [];
  for (let index = 0; index < value.length; index++) {
    // Add to the name and send it to loop through again
    let var_name = `${ name }[${ index }]`;
    let  item = value[ index ];
    rows = parse.all({ name: var_name, value: item, checked: '', }, debug);
  }
  return rows;
};  // Ends parse.array()


parse.null = function ({ name, value, checked }, debug) {
  return [get_story_row({ name: name, value: 'None', checked: 'true', })];
};  // Ends parse.null()


parse.string = function ({ name, value, checked }, debug) {
  return [get_story_row({ name: name, value: value, checked: '', })];
};  // Ends parse.string()


parse.number = function ({ name, value, checked }, debug) {
  return [get_story_row({ name: name, value: value, checked: '', })];
};  // Ends parse.number()


parse.boolean = function ({ name, value, checked }, debug) {
  // Checkbox, radioyesno, or yesno buttons
  let str = value.toString();
  let caps = str.charAt(0).toUpperCase() + str.slice(1);  // Turn into 'True' or 'False'
  return [get_story_row({ name: name, value: caps, checked: str, })];
};  // Ends parse.boolean()



let get_story = function( vars ) {
  return parse.all({
    name: '',
    value: vars,
  });
};  // Ends get_story()



// ============================
// ============================
// ============================
// UI
// ============================
// ============================
// ============================



// ============================
// Prepping start (and default) text
// ============================
let scenario = document.getElementById( 'scenario' );
let output = '';

// let get_num_signature_rows = function () {
//   let node = document.getElementById( 'num_signatures' );
//   let rows = 0;
//   if ( node && node.value && node.value !== '' ) {
//     rows = parseInt( node.value );
//   }
//   return rows;
// }

let get_YAML_file_name = function () {
  let node = document.getElementById( 'yaml_file_name' );
  let name = 'name_of_yaml_file';
  if ( node && node.value && node.value !== '' ) {
    name = node.value.replace( /\.yml$/, '' );
  }
  return name;
}

let get_question_id = function () {
  let node = document.getElementById( 'question_id' );
  let id = 'a question id';
  if ( node && node.value && node.value !== '' ) {
    id = node.value;
  }
  return id;
}

let get_scenario_description = function () {
  let node = document.getElementById( 'scenario_description' );
  let description = 'User has special circumstance';
  if ( node && node.value && node.value !== '' ) {
    description = node.value;
  }
  return description;
}

let get_test_start = function () {
  let test_start = `\nScenario: ${ get_scenario_description() }`;
  test_start += `\n\u00A0\u00A0Given I start the interview at "${ get_YAML_file_name() }"`;
  test_start += `\n\u00A0\u00A0And the user gets to "${ get_question_id() }" with this data:`;
  test_start += `\n\u00A0\u00A0\u00A0\u00A0| var | value | checked |`;
  return test_start;
}

scenario.innerText = get_test_start();
output = `\n\n${ get_test_start() }`;


// ============================
// Getting and showing the result
// ============================
let da_warning = document.getElementById( 'da_data_warning' );
let tableInput = document.getElementById( 'da_data' );
let data_error = document.querySelector( 'section#data_container .error_output' );

let update_output = function () {
  output = '\n\n@generated';
  let story = [];

  let data = null;
  let vars = null;
  try {
    data = JSON.parse( tableInput.value );
    vars = data.variables;
    da_warning.classList.remove('error');
    data_error.innerText = '';

    // Get data
    story = story.concat( get_story( vars ));

    // Add early part of test
    let test_length = `slow`;
    if ( story.length <= 20 ) { test_length = `fast`; }
    output += ` @${ test_length }`;

  // If no input or erroring input
  } catch ( err) {
    if ( tableInput.value !== '' ) {
      console.warn( err );
      da_warning.classList.add('error');
      data_error.innerText = err;
    }
  }
  
  output += get_test_start();
  // Add other rows if they exist
  for ( let row of story ) {
    output += `\n\u00A0\u00A0\u00A0\u00A0${ row }`;
  }
  // // Add signature rows if they exist
  // let sigs = Array( get_num_signature_rows() );
  // for ( let row of sigs ) {
  //   output += `\n\u00A0\u00A0\u00A0\u00A0|  |  | /sign |`;
  // }

  scenario.innerText = output;
};

tableInput.addEventListener( 'input', update_output );  // ends text area event listener



// ============================
// Extra options
// ============================
let auto_ignored = document.getElementById( 'auto_ignored_keys_only' );
auto_ignored.innerText = JSON.stringify( keys_to_ignore );

let ignore_anywhere = [];
let ignore_warning = document.getElementById( 'ignore_warning' );
let ignore_error = document.querySelector( 'section#extra_options_container .error_output' );

let to_fit = ['ignore_anywhere'];
document.body.addEventListener( 'input', function( event ) {
  if ( to_fit.includes( event.target.id )) {
    let area = event.target;
    let num_new_lines = (area.value.split( '\n' )).length;
    area.rows = num_new_lines;
  }
  if ( event.target.id === 'ignore_anywhere' ) {
    handle_ignore_error();
  }
});  // ends listen for input

let ignore_node = document.getElementById( 'ignore_anywhere' );
let ignore_anywhere_default_alphabetical = ignore_anywhere_default.sort(function (a, b) {
    if (a > b) { return 1; }
    if (b > a) { return -1; }
    return 0;
});

let handle_ignore_error = function () {
  if ( ignore_node.value ) {
    try {
      ignore_anywhere = JSON.parse( ignore_node.value );
      ignore_warning.classList.remove('error');
      ignore_error.innerText = '';
    } catch ( err) {
      console.warn( err );
      ignore_warning.classList.add('error');
      ignore_error.innerText = err;
      ignore_anywhere = ignore_anywhere_default_alphabetical;  // use default
    }
  } else if ( ignore_node.value === '' ) {
    ignore_anywhere = [];
  }
  update_output();
}

let reset_ignore_elem = function () {
  // Ignore text we should ignore wherever it appears, even in a fully formed variable name
  let ignore_node_initial_text = JSON.stringify( ignore_anywhere_default_alphabetical, null, 2 );
  let num_new_lines = (ignore_node_initial_text.split( '\n' )).length;
  ignore_node.rows = num_new_lines;
  ignore_node.value = ignore_node_initial_text;
  ignore_anywhere = ignore_anywhere_default_alphabetical;
  handle_ignore_error();
  update_output();
};
reset_ignore_elem();

// 'click' listeners
document.body.addEventListener( 'click', ( event ) => {
  if ( /toggler/.test(event.target.className)) {
    let toggler = event.target
    let id = toggler.getAttribute( 'for' );

    let to_toggle = document.getElementById( id );
    if ( !/expanded/.test( to_toggle.className )) {
      to_toggle.classList.add( 'expanded' );
      toggler.innerText = toggler.innerText.replace( 'Edit', 'Hide' );
      toggler.innerText = toggler.innerText.replace( '▼', '▲' );
    } else {
      to_toggle.classList.remove( 'expanded' );
      toggler.innerText = toggler.innerText.replace( 'Hide', 'Edit' );
      toggler.innerText = toggler.innerText.replace( '▲', '▼' );
    }
  } if ( event.target.id === 'reset_ignore' ) {
    reset_ignore_elem();
  }
});  // End listen for click

document.body.addEventListener( 'input', update_output );


// ============================
// Copying test stuff
// ============================
let copy_scenario_button = document.getElementById( 'copy_scenario' );
copy_scenario_button.addEventListener( 'click', ( elem ) => {
  navigator.clipboard.writeText( output );
});


let copy_feature_button = document.getElementById( 'copy_feature' );
let feature = document.getElementById( 'feature' );
copy_feature_button.addEventListener( 'click', ( elem ) => {
  navigator.clipboard.writeText( `${ feature.innerText }\n\n` );
});
