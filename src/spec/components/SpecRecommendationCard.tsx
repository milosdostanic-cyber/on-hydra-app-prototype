import { RecommendationCard } from '../../ui/antd';
import type { SpecRecommendation } from '../data/types';
import { SpecRecommendationTags } from './SpecRecommendationTags';

export function SpecRecommendationCard({
  recommendation,
  onReview,
}: {
  recommendation: SpecRecommendation;
  onReview: (recommendation: SpecRecommendation) => void;
}) {
  // Resolved (accepted/denied) → DS `RecommendationCard` `State=Resolved`.
  const resolved =
    recommendation.decision === 'accepted' || recommendation.decision === 'denied';

  return (
    <RecommendationCard
      aria-label={`Review ${recommendation.title}`}
      onClick={() => onReview(recommendation)}
      resolved={resolved}
      tags={<SpecRecommendationTags recommendation={recommendation} />}
      title={recommendation.title}
      description={recommendation.reason || undefined}
      meta={`Section ${recommendation.sectionNumber}   |   Page ${recommendation.sourceCitation.page}`}
      style={{ height: '100%', justifyContent: 'center' }}
    />
  );
}
