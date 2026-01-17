export interface ScheduleConfig {
  /**
   * Interval in seconds between website health checks
   */
  intervalSeconds: number;
}

/**
 * Configuration for EventBridge schedule
 */
export const scheduleConfig: ScheduleConfig = {
  // Check websites every 50 minutes (3000 seconds)
  intervalSeconds: 30,
};
