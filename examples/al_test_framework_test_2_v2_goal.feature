

@generated @slow
Scenario: User has special circumstance
  Given I start the interview at "name_of_yaml_file"
  And the user gets to "a question id" with this data:
    | var | value | checked |
    | a_plaintiff_s_motion_to_modify_qc_v20009 | True | true |
    | a_plaintiff_s_motion_to_modify_qc_v20009_intro | True | true |
    | a_plaintiff_s_motion_to_modify_qc_v20009_preview_question | True | true |
    | acknowledged_information_use | I accept the terms of use. | true |
    | acknowledged_information_use.minimum_number | None | true |
    | al_form_type | other |  |
    | al_intro_screen | True | true |
    | al_version | AL-2.0.19 |  |
    | avg_chars_per_word | 7 |  |
    | basic_questions_signature_flow | True | true |
    | docket_number | 1234 |  |
    | feedback_form | docassemble.MAVirtualCourt:feedback.yml |  |
    | is_plaintiff | I am the plaintiff | true |
    | is_plaintiff.minimum_number | None | true |
    | max_chars_total | 1089 |  |
    | modify_max_chars | 540 |  |
    | modify_max_words | 77.14285714285714 |  |
    | order_type | terminate |  |
    | other_parties[0].name.first | Def |  |
    | other_parties[0].name.last | Defo |  |
    | other_parties[0].name.middle |  |  |
    | other_parties[0].name.suffix |  |  |
    | other_parties[0].other_addresses.minimum_number | None | true |
    | other_parties[0].previous_addresses.minimum_number | None | true |
    | other_parties.minimum_number | None | true |
    | other_parties.revisit | True | true |
    | other_parties.target_number | 1 |  |
    | other_parties.there_are_any | True | true |
    | reason | Some reason |  |
    | saw_signature_choice | True | true |
    | signature | users[0].signature |  |
    | signature_choice | this device |  |
    | signature_date | 05/31/2021 |  |
    | trial_court | all_courts[0] | true |
    | trial_court.address | all_courts[0].address | true |
    | trial_court.address.address | 88 North Main St. |  |
    | trial_court.address.city | Attleboro |  |
    | trial_court.address.county | Bristol County |  |
    | trial_court.address.state | MA |  |
    | trial_court.address.zip | 02703 |  |
    | trial_court.description | The Attleboro District Court serves Attleboro, Mansfield, North Attleboro, and Norton. |  |
    | trial_court.name | Attleboro District Court |  |
    | trial_court.phone | (508) 222-5900  |  |
    | understand_yes | Yes | true |
    | understand_yes.minimum_number | None | true |
    | users[0].name.first | Uli |  |
    | users[0].name.last | Username |  |
    | users[0].name.middle |  |  |
    | users[0].name.suffix |  |  |
    | users[0].other_addresses.minimum_number | None | true |
    | users[0].previous_addresses.minimum_number | None | true |
    | users[0].signature | /sign |  |
    | users[0].signature.number | 60935 |  |
    | users[0].signature.ok | True | true |
    | users[0].states_above_true | states_true | true |
    | users[0].states_above_true.minimum_number | None | true |
    | users.minimum_number | None | true |
    | users.revisit | True | true |
    | users.target_number | 1 |  |
    | users.there_are_any | True | true |
    | what_to_modify |  |  |