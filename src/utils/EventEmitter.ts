/**
 * A simple event emitter for communicating between components in React Native
 * ใช้แทน CustomEvent ซึ่งไม่สามารถใช้ได้ใน React Native (Hermes)
 */

type EventListener = (...args: any[]) => void;

class SimpleEventEmitter {
  private events: Record<string, EventListener[]> = {};

  /**
   * Subscribe to an event
   * @param event Event name
   * @param listener Function to call when event is emitted
   * @returns Unsubscribe function
   */
  on(event: string, listener: EventListener): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);

    // Return unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter(l => l !== listener);
    };
  }

  /**
   * Emit an event
   * @param event Event name
   * @param args Arguments to pass to listeners
   */
  emit(event: string, ...args: any[]): void {
    if (this.events[event]) {
      this.events[event].forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Remove all listeners for an event
   * @param event Event name
   */
  removeAllListeners(event?: string): void {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

// Create a singleton instance
export const EventEmitter = new SimpleEventEmitter(); 