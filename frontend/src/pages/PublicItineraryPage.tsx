import { useParams, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "naive-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Datos simulados (mock data) - siempre disponibles
const mockItinerary = {
  id: 1,
  client: {
    fullName: "María González",
  },
  schedule: {
    scheduleDate: new Date().toISOString(),
  },
  items: [
    {
      activity: {
        name: "Tour Histórico Centro",
      },
    },
    {
      activity: {
        name: "Almuerzo en playa",
      },
    },
  ],
  totalAmount: 125.5,
  publicToken: "mock-token-12345",
};

export default function PublicItineraryPage() {
  const { publicToken } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showMock, setShowMock] = useState(false);

  const { data, isError } = useQuery({
    queryKey: ["itinerary", publicToken],
    queryFn: async () => {
      const response = await axios.get("/api/itineraries/public-token/" + publicToken);
      return response.data;
    },
    enabled: !!publicToken,
    onError: () => {
      setShowMock(true);
    },
  });

  useEffect(() => {
    if (isError || !data) {
      setShowMock(true);
    }
    setIsLoading(false);
  }, [isError, data]);

  // Usar datos reales si existen, sino usar mock data
  const itinerary = data?.itinerary || mockItinerary;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>Itinerario</CardHeader>
        <CardContent>Cargando itinerario...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>Itinerario - {itinerary.client.fullName}</CardHeader>
      <CardContent>
        <p><strong>Fecha:</strong> {new Date(itinerary.schedule.scheduleDate).toLocaleDateString()}</p>
        <p><strong>Actividades:</strong> {itinerary.items?.map((item) => item.activity.name).join(", ") || "Ninguna"}</p>
        <p><strong>Total:</strong> $` + itinerary.totalAmount + `</p>
        <Button onClick={() => navigate("/" + itinerary.publicToken + "/review")}>
          Calificar
        </Button>
      </CardContent>
    </Card>
  );
}