// ============================
// Cut down on unneeded data
// ============================

// Ignore text we should ignore wherever it appears, even in
// the middle of a fully formed variable name
let ignore_anywhere_in_var_name_default = [
  // === AssemblyLine-specific keywords to skip
  "AL_DEFAULT_COUNTRY",
  "AL_ORGANIZATION_HOMEPAGE",
  "AL_ORGANIZATION_TITLE",
  "al_enable_incomplete_downloads",
  "al_logo",
  "al_menu_items",
  "al_version",
  "al_session_store_default_filename",
  "all_answer_sets",
  "menu_items",  // da-specific?
  "._",
  "_attachment",
  "_bundle",
  "court_emails",
  "download_titles",
  "form_approved_for_email_filing",
  "github_user",
  "interview_metadata",
  "interview_short_title",
  "macourts",
  "package_name",
  "package_version_number",
  "preferred_court",
  "signature_fields",
  "speak_text",
  "started_on_phone",
  "user_has_saved_answers",
  "github_repo_name",
  "allow_cron",
  "allowed_courts",
  "_geocoded",
  ".uses_parts",
  `.court_code`,
  `.department`,
  // `.name`, `.phone`, `.description`,
  `.division`,
  `.fax`,
  `.has_po_box`,

  // === docassemble-specific
  "county_dict",  // Not sure about this one
  "countyinfo",  // Not sure about this one
  "mimetype",  // Not sure about this one
  // "filename",  // Possibility to identify some signatures
  "_internal",
  "nav",
  "url_args",
  "_class",
  "auto_gather",
  "instanceName",
  "multi_user",
  // --- files
  "file_info",
  "persistent",
  "private",
  "convert_to_pdf_a",
  "convert_to_tagged_pdf",
  "extension",
  "valid_formats",
  "encrypted",
  "has_specific_filename",
  // --- address
  "geolocate_response",
  "norm_long",
  "city_only",
  "geolocated",
  "orig_address",
  "latitude",
  "longitude",
  "norm",
  "geolocate_success",
  "complete_attribute",
];

let ignore_if_is_key = [
  // === AssemblyLine-specific keywords to skip
  "all_courts",
  // === docassemble-specific. Less sure these are safe to ignore
  "alt_text",
  "ask_number",
  "ask_object_type",
  "object_type",
  "gathered",
  "minimum_number",
];
