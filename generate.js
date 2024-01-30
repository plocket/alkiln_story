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
let get_story_row = function({ name, value, }, debug=false) {
  let row;

  // Ignore text we should ignore wherever it appears, even in a fully formed variable name
  if ( ignore_anywhere_in_var_name.includes( name )) { return row; }
  for ( let to_ignore of ignore_anywhere_in_var_name ) {
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
    value = '';
  }

  // Let dev know about `.there_is_another`
  if ( /\.there_is_another$/.test( name ) ) {
    value = '--- invalid. See docs at https://suffolklitlab.org/docassemble-AssemblyLine-documentation/docs/automated_integrated_testing/#there_is_another-loop --- '
  }

  row = `| ${ name } | ${ value } |  |`;
  // The below creates ascii code `194 160` in the clipboard when user uses 'Copy' button
  // row = row.replace(/ /g, ' ');  // Avoid collapsing multiple sapces (darn HTML!)

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

parse.start = function ({ name, value, }, debug) {
  // Starts things off and builds the story.
  let all = parse.filter({ name, value, }, debug);
  
  // Get unique rows that are strings (removing `undefined`)
  let story = [];
  for ( let row of all ) {
    if ( story.indexOf( row ) === -1 && typeof row === 'string' ){
      story.push( row );
    }
  }

  return story;
};  // End parse.start()


parse.filter = function ({ name, value, }, debug) {
  // Filters - makes sure each item in processed by the
  // right function based on its type.
  if ( ignore_if_is_key.includes( name )) { return []; }
  if ( ignore_anywhere_in_var_name.includes( name )) { return []; }  // logging everything was annoying

  let var_name = name;
  let val_type = typeof value;
  let rows = [];

  if ( Array.isArray( value )) {
    rows = parse.array({ name: var_name, value: value, }, debug);

  } else if ( value === null ) {
    rows = parse.null({ name: var_name, value: value, }, debug);

  } else if ( value !== null && parse[ val_type ] ) {
    rows = parse[ val_type ]({ name: var_name, value: value, }, debug);
  
  } else {
    console.warn( 'Sorry, something has not been accounted for. You will have to do some editing to get this to work.', var_name, typeof value);
  }

  return rows;
};  // End parse.filter()


parse.object = function ({ name, value, }, debug) {
  let rows = [];
  let is_class = `_class` in value;
  if ( is_class && value._class.includes( `DADict` )) {
    is_class = false;
  }
  
  // Special case for obj with a different instanceName. May represent a
  // choice/dropdown created with `code:` and a list of objects
  // so one of those objects is the value of this variable.
  // Note: In the end, this may not be enough. It may be that some
  // of these situations cause their instanceName to need its values
  // set as well and we may need to loop using the instanceName as
  // the name itself. We'll have to keep an eye out for it.
  if ( value.instanceName && name !== value.instanceName ) {
    rows = parse.object_choice({ name, value, }, debug);
  }

  // `elements` can be (are always?) checkbox items
  let { elements, ...new_obj } = value;
  if ( elements ) {
    // Skip adding `element` to the name and don't get any other props
    // This `return`` might be what skips objects like trial_court
    rows = parse.elements({ name, value: elements, }, debug);
  }

  for ( let key in new_obj ) {
    if ( ignore_if_is_key.includes( key )) { continue; }
    if ( ignore_anywhere_in_var_name.includes( key )) { continue; }  // logging everything was annoying

    let var_name = get_object_name( is_class, name, key, debug );
    let new_value = new_obj[ key ];
    let val_type = typeof new_value;
    // Send the contents of the object to be filtered
    let new_rows = parse.filter({ name: var_name, value: new_value, }, debug);

    rows = rows.concat( new_rows );
  }  // ends for key in new_obj

  return rows;
};  // Ends parse.object()


parse.elements = function ({ name, value, }, debug) {
  /* Skip adding `element` to the name and don't get any other props.
  * Detect 'None' for checkboxes, etc. */
  let rows = [];

  // If it's a non-array object
  if ( !Array.isArray( value )) {
    // See if we need a 'none of the above' row
    let were_checkboxes = false;
    let any_true = false;
    for ( let key in value ) {
      let one_row;

      // checkbox objects are key/bool pairs. Do special checks and
      // get story row right here. (Can this sometimes be buttons?)
      if ( typeof value[ key ] === 'boolean' ) {
        were_checkboxes = true;
        if ( value[ key ] === true ) {
          any_true = true;
        }

        // Multi-option checkbox fields are different than others
        let one_row = parse.boolean({
          name: get_object_name( false, name, key, debug ),
          value: value[ key ],
        }, debug);
        rows = rows.concat( one_row );

      } else {
        // Dig deeper. Not sure when this would happen
        rows = rows.concat( parse.filter({ name, value, }, debug ));
      }
    }  // ends for choice in value

    // If all checkboxes were false, we need a 'none of the above' row
    if ( were_checkboxes ) {
      if ( !any_true ) {
        let nota_row = parse.boolean({
          name: get_object_name( false, name, 'None', debug ),
          value: 'True',
        }, debug );
        rows = rows.concat( nota_row );
      }
    }
  } else {
    rows = rows.concat( parse.filter({ name, value, }, debug ));
  }

  return rows;
};  // Ends parse.elements()


parse.object_choice = function ({ name, value, }, debug ) {
  // May represent a choice/dropdown created with `code:` and
  // a list of objects so one of those objects is the value of
  // this variable. The instanceName is what will be listed as
  // `value` of the HTML element.
  return [ get_story_row({
    name: name,
    value: value.instanceName,
  }, debug )];
}


parse.array = function ({ name, value, }, debug ) {
  // When does this happen? I know there are times...
  let rows = [];
  for (let index = 0; index < value.length; index++) {
    // Add to the name and send it to loop through again
    let var_name = `${ name }[${ index }]`;
    let item = value[ index ];
    let new_rows = parse.filter({ name: var_name, value: item, }, debug);
    rows = rows.concat( new_rows );
  }
  return rows;
};  // Ends parse.array()


parse.null = function ({ name, value, }, debug) {
  return [get_story_row({ name: name, value: 'None', })];
};  // Ends parse.null()


parse.string = function ({ name, value, }, debug) {
  return [get_story_row({ name: name, value: value, })];
};  // Ends parse.string()


parse.number = function ({ name, value, }, debug) {
  return [get_story_row({ name: name, value: value, })];
};  // Ends parse.number()


parse.boolean = function ({ name, value, }, debug) {
  // Checkbox, radioyesno, or yesno buttons
  let str = value.toString();
  let caps = str.charAt(0).toUpperCase() + str.slice(1);  // Turn into 'True' or 'False'
  return [get_story_row({ name: name, value: caps, })];
};  // Ends parse.boolean()


let get_object_name = function( is_class, name, key, debug ) {
  if ( name === '' ) {
    return key;
  } else {
    if ( is_class ) { return `${ name }.${ key }`; }
    else { return `${ name }['${ key }']`; }
  }
};



let get_story = function( vars ) {
  return parse.start({
    name: '',
    value: vars,
  }, false);
};  // Ends get_story()



// ============================
// ============================
// ============================
// UI
// ============================
// ============================
// ============================



// ============================
// Output - Prepping start (and default) text
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

let get_YAML_file_name = function ({ data }) {
  let node = document.getElementById( 'yaml_file_name' );
  // Example data.i filename: docassemble.playground12ALTestingTestMain:all_tests.yml
  let name = (data && data.i && data.i.replace( /.+:/, '' )) || node.placeholder;
  if ( node && node.value && node.value !== '' ) {
    name = node.value;
  }
  return name;
}

let get_question_id = function () {
  let node = document.getElementById( 'question_id' );
  let id = node.placeholder;
  if ( node && node.value && node.value !== '' ) {
    id = node.value;
  }
  return id;
}

let get_feature_description = function () {
  let node = document.getElementById( 'feature_description' );
  let description = node.placeholder;
  if ( node && node.value && node.value !== '' ) {
    description = node.value;
  }
  return description;
}

let get_scenario_description = function () {
  let node = document.getElementById( 'scenario_description' );
  let description = node.placeholder;
  if ( node && node.value && node.value !== '' ) {
    description = node.value;
  }
  return description;
}

function set_download_name() {
  let filename_node = document.getElementById('new_file_name');
  let name = filename_node.placeholder;
  if ( filename_node && filename_node.value && filename_node.value !== '' ) {
    name = filename_node.value;
  }
  if ( !name.endsWith('.feature') ) {
    name += '.feature';
  }
  let download_node = document.getElementById('download_test_file');
  download_node.download = name;
}

let get_test_start = function ({ data }) {
  data = data || {};
  let test_start = `Feature: ${ get_feature_description() || get_scenario_description() }`;
  test_start += `\n`;
  test_start += `\nScenario: ${ get_scenario_description() }`;
  test_start += `\n  Given I start the interview at "${ get_YAML_file_name({ data: {} }) }"`;
  test_start += `\n  And the user gets to "${ get_question_id() }" with this data:`;
  test_start += `\n    | var | value | trigger |`;
  return test_start;
}

let update_var_data_error = function ( err_msg ) {
  // Either make the error visible or hide it, depending on what's needed
  // Needs a better name or something
  console.log(1)
  console.log(err_msg)
  if ( err_msg !== '' ) {
    console.log(2)
    console.error( err_msg );
    document.getElementById('data_error_container').className = document.getElementById('data_error_container').className.replace(/\s*hidden/, '');
  } else {
    console.log(3)
    document.getElementById('data_error_container').className = document.getElementById('data_error_container').className += ' hidden';
  }
  data_error.innerText = err_msg;
}

scenario.innerText = get_test_start({ data: {} });
output = `\n\n${ get_test_start({ data: {} }) }`;


// ============================
// Output - Getting and showing the result
// ============================
let da_warning = document.getElementById( 'da_data_warning' );
let tableInput = document.getElementById( 'da_data' );
let data_error = document.getElementById( 'data_error_output' );

let update_output = function () {
  let story = [];

  let data = {};
  let vars = null;
  try {
    data = JSON.parse( tableInput.value );
    vars = data.variables;
    update_var_data_error('');

    let filename = get_YAML_file_name({ data });
    document.getElementById('yaml_file_name').value = filename;

    // Get data
    story = story.concat( get_story( vars ));

  // If no input or erroring input
  } catch ( error) {
    if ( tableInput.value !== '' ) {
      update_var_data_error( error );
    } else {
      // Don't show error when textarea is empty again
      update_var_data_error('');
    }
  }
  
  let output = get_test_start({ data });
  // Add other rows if they exist
  for ( let row of story ) {
    output += `\n    ${ row }`;
  }

  scenario.innerText = output;

  set_download_name();
  let download = document.getElementById(`download_test_file`);
  // No extra spaces
  download.href = `data:text/plain,${ encodeURIComponent( output )}`;
};

tableInput.addEventListener( 'input', update_output );  // ends text area event listener



// ============================
// Adjusting size of elements based on their contents
// ============================
// At the moment, only `ignore_anywhere_in_var_name` is being adjusted
let fit_to_content_ids = ['ignore_anywhere_in_var_name'];

let fit_textarea_to_content = function ( node ) {
  if ( fit_to_content_ids.includes( node.id )) {
    let num_new_lines = ( node.value.split( '\n' )).length;
    node.rows = num_new_lines;
  }
}


// TODO: Rearrange the sections to be closer to their values/defaults
// TODO: Refactor name to 'exclude' instead of 'ignore'
// ============================
// Excluding rows based on their contents
// ============================
// ignore_if_is_key tests only the variable names, not the whole contents of the row.
// THIS VALUE STAYS THE SAME ALWAYS. It's hard-coded in here.
// Show this list to the user so they might better understand what's going on.
let keys_to_exclude_node = document.getElementById( 'auto_excluded_keys_only' );
let keys_exclude_text = ignore_if_is_key.join('\n');
keys_to_exclude_node.innerHTML = keys_exclude_text;  //JSON.stringify( ignore_if_is_key, null, 2 );

// 
// ignore_anywhere_in_var_name CAN change. Show current value and allow changes.
let exclude_anywhere_in_var_name_node = document.getElementById( 'ignore_anywhere_in_var_name' );
let ignore_anywhere_default_alphabetical = ignore_anywhere_in_var_name_default.sort(function (a, b) {
    if (a > b) { return 1; }
    if (b > a) { return -1; }
    return 0;
});
let ignore_anywhere_in_var_name = ignore_anywhere_default_alphabetical;
exclude_anywhere_in_var_name_node.value = JSON.stringify( ignore_anywhere_in_var_name, null, 2 );
let ignore_error = document.getElementById( 'ignored_error_output' );


// Listen for changes that customize the ignore_anywhere_in_var_name list
document.body.addEventListener( 'input', function( event ) {
  fit_textarea_to_content( event.target );
  if ( event.target.id === 'ignore_anywhere_in_var_name' ) {
    update_exclude_anywhere( event.target.value );
    update_output();
  }
});  // ends listen for input

let update_custom_exclusion_error = function ( err_msg ) {
  // Either make the error visible or hide it, depending on what's needed
  // Needs a better name or something too
  if ( err_msg !== '' ) { console.error( err_msg ); }
  ignore_error.innerText = err_msg;
}

let update_exclude_anywhere = function ( new_value ) {
  // Set the value for ignore_anywhere_in_var_name and size of textarea. Handle errors.
  // Do not change contents of textarea or user will not be able to edit it.
  if ( new_value ) {
    try {
      let maybe_exclusion_list = new_value;
      if ( typeof new_value === `string` ) { maybe_exclusion_list = JSON.parse( new_value ); }
      if ( !Array.isArray( maybe_exclusion_list )) {
        // Does not yet test that every item is a string
        let error = `Error: The data is not a JSON list of strings. This tool can only use a list of strings to exclude rows in the story table.`
        update_custom_exclusion_error( error );
      } else {
        ignore_anywhere_in_var_name = maybe_exclusion_list;
        update_custom_exclusion_error('');
      }
    } catch ( error ) {
      update_custom_exclusion_error( error );
    }
  } else {
    update_custom_exclusion_error('');
    ignore_anywhere_in_var_name = [];
  }

  fit_textarea_to_content( exclude_anywhere_in_var_name_node );
}

let exclude_uploader = document.getElementById(`exclude_upload`);
exclude_uploader.addEventListener( 'change', function () {
  // Allow uploading JSON list to ignore specific variables
  let reader = createReader();
  if ( !reader ) { return; }

  if ( exclude_uploader.files && exclude_uploader.files[0] ) {
    reader.onload = function() {
      try {
        // Get the data
        let custom_exclusion_json = JSON.parse( reader.result );
        exclude_anywhere_in_var_name_node.value = JSON.stringify( custom_exclusion_json, null, 2 );
        update_exclude_anywhere( custom_exclusion_json );
        // Build the new story
        update_output();
      } catch ( error ) {
        update_custom_exclusion_error( `Could not load "${ exclude_uploader.files[0].name }". ${ error }` );
      }
      exclude_uploader.value = "";
    };
    reader.readAsText( exclude_uploader.files[0] );
  }

});

let reset_ignore_anywhere = function () {
  // Ignore text we should ignore wherever it appears, even in a fully formed variable name
  exclude_anywhere_in_var_name_node.value = JSON.stringify( ignore_anywhere_default_alphabetical, null, 2 );
  update_exclude_anywhere( ignore_anywhere_default_alphabetical );
  update_output();
};
// 'Reset' it at the start
reset_ignore_anywhere();

// TODO: allow easier formatting for list of vars to ignore
function convert_to_human_ignore_list() {}

function convert_from_human_ignore_list() {}

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
    reset_ignore_anywhere();
  }
});  // End listen for click

document.body.addEventListener( 'input', update_output );



// ============================
// Uploading
// ============================
// https://stackoverflow.com/a/13709663/14144258
// https://stackoverflow.com/a/13709663/14144258
let vars_uploader = document.getElementById(`var_data_upload`);


let createReader = function () {
  if ( window.File && window.FileReader && window.FileList && window.Blob ) {
    let reader = new FileReader();
    return reader;
  } else {
    alert('The File APIs are not fully supported by your browser, so you cannot upload files. Copy/paste the values instead.');
    return false;
  }
};

vars_uploader.addEventListener( 'change', function () {
  // Allow uploading JSON var data from da interview 'show variables and values' page
  let reader = createReader();
  if ( !reader ) { return; }

  if ( vars_uploader.files && vars_uploader.files[0] ) {
    reader.onload = function() {
      try {
        // Show the textarea value in the DOM
        let custom_exclusion_json = JSON.parse( reader.result );
        tableInput.value = JSON.stringify( custom_exclusion_json, null, 2 );
        // Build the new story
        update_output();
        update_var_data_error( '' );
      } catch ( error ) {
        update_var_data_error( `Could not load "${ vars_uploader.files[0].name }". ${ error }` );

      }
      vars_uploader.value = "";
    };
    reader.readAsText( vars_uploader.files[0] );
  }
});


// ============================
// Copying test stuff
// ============================
let copy_scenario_button = document.getElementById( 'copy_scenario' );
copy_scenario_button.addEventListener( 'click', ( elem ) => {
  navigator.clipboard.writeText( output );
});

