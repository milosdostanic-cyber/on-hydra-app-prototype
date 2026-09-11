/**
 * Mock analytics logger for Spec (PRD §18).
 * Never includes specification text, clause text, comments, or source excerpts.
 */

export type SpecAnalyticsEvent =
  | 'spec_home_viewed'
  | 'spec_library_filtered'
  | 'spec_library_saved_search_applied'
  | 'spec_project_viewed'
  | 'spec_upload_started'
  | 'spec_upload_validated'
  | 'spec_upload_rejected'
  | 'spec_processing_started'
  | 'spec_processing_stage_completed'
  | 'spec_processing_failed'
  | 'spec_processing_cancelled'
  | 'spec_processing_retried'
  | 'spec_analyze_opened'
  | 'spec_recommendation_review_started'
  | 'spec_section_selected'
  | 'spec_citation_opened'
  | 'spec_correction_opened'
  | 'spec_correction_saved'
  | 'spec_edit_opened'
  | 'spec_review_opened'
  | 'spec_review_redline_exported'
  | 'spec_change_accepted'
  | 'spec_change_rejected'
  | 'spec_proposal_accepted'
  | 'spec_proposal_rejected'
  | 'spec_version_saved'
  | 'spec_comment_added'
  | 'spec_delta_to_change'
  | 'spec_products_opened'
  | 'spec_submittals_opened'
  | 'spec_substitution_opened'
  | 'spec_ask_opened'
  | 'spec_ask_submitted'
  | 'spec_ask_change_created'
  | 'spec_deliver_back_opened'
  | 'spec_deliver_back_accepted'
  | 'spec_deliver_back_revision'
  | 'spec_deliver_back_downloaded'
  | 'spec_guide_opened'
  | 'spec_guide_language_inserted'
  | 'spec_guide_export_mocked'
  | 'spec_master_downloaded'
  | 'spec_demo_scenario_switched'
  | 'spec_demo_reset'
  | 'spec_role_simulated';

export type SpecAnalyticsPayload = Record<string, string | number | boolean | undefined>;

const LOG_PREFIX = '[spec-analytics]';

export function trackSpecEvent(event: SpecAnalyticsEvent, payload: SpecAnalyticsPayload = {}): void {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info(LOG_PREFIX, event, payload);
  }
}
