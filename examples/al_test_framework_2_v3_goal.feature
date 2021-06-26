

@generated @slow
Scenario: User has special circumstance
  Given I start the interview at "name_of_yaml_file"
  And the user gets to "a question id" with this data:
    | var | value | trigger |
    | a_plaintiff_s_motion_to_modify_qc_v20009 | True |  |
    | a_plaintiff_s_motion_to_modify_qc_v20009_intro | True |  |
    | a_plaintiff_s_motion_to_modify_qc_v20009_preview_question | True |  |
    | acknowledged_information_use['I accept the terms of use.'] |  |  |
    | acknowledged_information_use.minimum_number | None |  |
    | al_form_type | other |  |
    | al_intro_screen | True |  |
    | al_version | AL-2.0.19 |  |
    | avg_chars_per_word | 7 |  |
    | basic_questions_signature_flow | True |  |
    | docket_number | 1234 |  |
    | feedback_form | docassemble.MAVirtualCourt:feedback.yml |  |
    | is_plaintiff['I am the plaintiff'] |  |  |
    | is_plaintiff.minimum_number | None |  |
    | max_chars_total | 1089 |  |
    | modify_max_chars | 540 |  |
    | modify_max_words | 77.14285714285714 |  |
    | order_type | terminate |  |
    | other_parties[0].name.first | Def |  |
    | other_parties[0].name.last | Defo |  |
    | other_parties[0].name.middle |  |  |
    | other_parties[0].name.suffix |  |  |
    | other_parties[0].other_addresses.minimum_number | None |  |
    | other_parties[0].previous_addresses.minimum_number | None |  |
    | other_parties.minimum_number | None |  |
    | other_parties.revisit | True |  |
    | other_parties.target_number | 1 |  |
    | other_parties.there_are_any | True |  |
    | reason | Some reason |  |
    | saw_signature_choice | True |  |
    | signature | users[0].signature |  |
    | signature_choice | this device |  |
    | signature_date | 05/31/2021 |  |
    | trial_court | all_courts[0] |  |
    | trial_court.address | all_courts[0].address |  |
    | trial_court.address.address | 88 North Main St. |  |
    | trial_court.address.city | Attleboro |  |
    | trial_court.address.county | Bristol County |  |
    | trial_court.address.state | MA |  |
    | trial_court.address.zip | 02703 |  |
    | trial_court.description | The Attleboro District Court serves Attleboro, Mansfield, North Attleboro, and Norton. |  |
    | trial_court.name | Attleboro District Court |  |
    | trial_court.phone | (508) 222-5900  |  |
    | understand_yes['Yes'] |  |  |
    | understand_yes.minimum_number | None |  |
    | users[0].name.first | Uli |  |
    | users[0].name.last | Username |  |
    | users[0].name.middle |  |  |
    | users[0].name.suffix |  |  |
    | users[0].other_addresses.minimum_number | None |  |
    | users[0].previous_addresses.minimum_number | None |  |
    | users[0].signature |  |  |
    | users[0].signature.number | 60935 |  |
    | users[0].signature.ok | True |  |
    | users[0].states_above_true['states_true'] |  |  |
    | users[0].states_above_true.minimum_number | None |  |
    | users.minimum_number | None |  |
    | users.revisit | True |  |
    | users.target_number | 1 |  |
    | users.there_are_any | True |  |
    | what_to_modify |  |  |