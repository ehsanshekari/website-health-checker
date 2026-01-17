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
  // Check websites every 5 minutes (300 seconds)
  intervalSeconds: 30,
};
