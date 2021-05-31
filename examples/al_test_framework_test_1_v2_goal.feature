Feature: Description of broad purpose for all scenarios in here

Note: What we want v2 to look like

@generated @fast
Scenario: User has special circumstance
  Given I start the interview at "name_of_yaml_file"
  And the user gets to "a question id" with this data:
    | var | value | checked |
    | button_continue | True | true |
    | buttons_other | button_2 |  |
    | buttons_yesnomaybe | None | true |
    | checkboxes_other | checkbox_other_opt_1 | false |
    | checkboxes_other | checkbox_other_opt_2 | true |
    | checkboxes_other | checkbox_other_opt_3 | true |
    | checkboxes_other.minimum_number | None | true |
    | checkboxes_yesno | False | false |
    | direct_showifs | True | true |
    | direct_standard_fields | True | true |
    | dropdown_test | dropdown_opt_2 |  |
    | proxy_list[0].name.first | proxy 1 |  |
    | proxy_list[1].name.first | proxy 2 |  |
    | proxy_list.minimum_number | None | true |
    | proxy_list.there_are_any | True | true |
    | radio_other | radio_other_opt_2 |  |
    | radio_yesno | False | false |
    | screen_features | True | true |
    | show_2 | True | true |
    | show_3 | True | true |
    | showif_checkbox_yesno | False | false |
    | showif_dropdown | showif_dropdown_4 |  |
    | showif_radio_other | showif_radio_multi_2 |  |
    | showif_text_input | showif text input |  |
    | showif_textarea | showif\r\nmulti\r\nline |  |
    | showif_yesnoradio | False | false |
    | signature_1 | /sign |  |
    | signature_1.number | 56859 |  |
    | signature_1.ok | True | true |
    | signature_2 | /sign |  |
    | signature_2.number | 56860 |  |
    | signature_2.ok | True | true |
    | text_input | regular text input |  |
    | textarea | regular\r\nmulti\r\nline |  |
