import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { recommendationService } from "@/services/recommendationService";
import { buildEnhancedRecommendationFromRecord } from "@/services/recommendationBuilder";
import { FertilizerRecommendation } from "@/services/supabaseClient";
import DetailedFertilizerRecommendations from "@/components/DetailedFertilizerRecommendations";
import { useLanguage } from "@/contexts/LanguageContext";

const DetailedRecommendationsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [rec, setRec] = useState<FertilizerRecommendation | null>(null);
  const [loading, setLoading] = useState(true);

  const { recommendationId, isFromHistory, recommendation } =
    location.state || {};

  useEffect(() => {
    const load = async () => {
      if (recommendation) {
        // Use the recommendation passed in state
        setRec(recommendation);
        setLoading(false);
      } else if (recommendationId) {
        // Fetch the recommendation by ID
        setLoading(true);
        const { data } = await recommendationService.getRecommendationById(
          recommendationId
        );
        setRec(data || null);
        setLoading(false);
      } else {
        // No data provided, redirect to dashboard
        navigate("/dashboard");
      }
    };

    load();
  }, [recommendationId, recommendation, navigate]);

  const { recommendations, formData } = useMemo(() => {
    if (!rec) return { recommendations: null, formData: null } as any;
    return buildEnhancedRecommendationFromRecord(rec);
  }, [rec]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-grass-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!rec || !formData || !recommendations) {
    navigate("/dashboard");
    return null;
  }

  return (
    <DetailedFertilizerRecommendations
      recommendations={recommendations as any}
      formData={formData as any}
      isFromHistory={isFromHistory}
    />
  );
};

export default DetailedRecommendationsPage;
