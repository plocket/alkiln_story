Feature: Description of broad purpose for all scenarios in here

Note: What we want v2 to look like

@generated @fast
Scenario: User has special circumstance
  Given I start the interview at "name_of_yaml_file"
  And the user gets to "a question id" with this data:
    | var | value | trigger |
    | button_continue | True |  |
    | buttons_other | button_2 |  |
    | buttons_yesnomaybe | None |  |
    | checkboxes_other['checkbox_other_opt_1'] | True |  |
    | checkboxes_other['checkbox_other_opt_2'] | True |  |
    | checkboxes_other['checkbox_other_opt_3'] | True |  |
    | checkboxes_other.minimum_number | None |  |
    | checkboxes_yesno | False |  |
    | direct_showifs | True |  |
    | direct_standard_fields | True |  |
    | dropdown_test | dropdown_opt_2 |  |
    | proxy_list[0].name.first | proxy 1 |  |
    | proxy_list[1].name.first | proxy 2 |  |
    | proxy_list.minimum_number | None |  |
    | proxy_list.there_are_any | ----invalid---- |  |
    | radio_other | radio_other_opt_2 |  |
    | radio_yesno | False |  |
    | screen_features | True |  |
    | show_2 | True |  |
    | show_3 | True |  |
    | showif_checkbox_yesno | False |  |
    | showif_dropdown | showif_dropdown_4 |  |
    | showif_radio_other | showif_radio_multi_2 |  |
    | showif_text_input | showif text input |  |
    | showif_textarea | showif\r\nmulti\r\nline |  |
    | showif_yesnoradio | False |  |
    | signature_1 | |  |
    | signature_1.number | 56859 |  |
    | signature_1.ok | True |  |
    | signature_2 | |  |
    | signature_2.number | 56860 |  |
    | signature_2.ok | True |  |
    | text_input | regular text input |  |
    | textarea | regular\r\nmulti\r\nline |  |
