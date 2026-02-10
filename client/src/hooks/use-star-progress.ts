import { useQuery } from "@tanstack/react-query";
import { StarProgress, StarMission } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export function useStarProgress() {
  const { data: progress } = useQuery<StarProgress>({
    queryKey: ["/api/stars/progress"],
  });

  const { data: missions } = useQuery<StarMission[]>({
    queryKey: ["/api/stars/missions"],
  });

  const { toast } = useToast();

  const triggerStarEvent = async (eventType: string, amount: number = 1, metadata?: any) => {
    try {
      const res = await fetch("/api/stars/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType, amount, metadata }),
      });
      const result = await res.json();
      if (result.success) {
        // Subtle toast or animation trigger could go here
        queryClient.invalidateQueries({ queryKey: ["/api/stars/progress"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stars/missions"] });
      }
      return result;
    } catch (error) {
      console.error("Star trigger error:", error);
    }
  };

  return {
    progress,
    missions,
    triggerStarEvent
  };
}
