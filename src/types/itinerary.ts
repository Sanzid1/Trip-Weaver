export interface Itinerary {
  id: string;
  user_id: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget: string;
  travel_style: string;
  interests: string[];
  created_at: string;
  itinerary_data: {
    days: Array<{
      date: string;
      activities: Array<{
        time: string;
        title: string;
        description: string;
        location: {
          name: string;
          coordinates: [number, number];
        };
      }>;
    }>;
  };
}