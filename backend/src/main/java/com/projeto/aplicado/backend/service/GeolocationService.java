package com.projeto.aplicado.backend.service;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Service
public class GeolocationService {
    private final HttpClient httpClient;

    public GeolocationService() {
        this.httpClient = HttpClient.newHttpClient();
    }

    public double[] getCoordinatesFromAddress(String address) {
        try {
            String encodedAddress = URLEncoder.encode(address, StandardCharsets.UTF_8);
            String url = "https://nominatim.openstreetmap.org/search?format=json&q=" + encodedAddress;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", "Java HttpClient")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            JSONArray jsonArray = new JSONArray(response.body());

            if (jsonArray.isEmpty()) {
                return new double[]{0.0, 0.0};
            }

            JSONObject location = jsonArray.getJSONObject(0);
            double lat = Double.parseDouble(location.getString("lat"));
            double lon = Double.parseDouble(location.getString("lon"));

            return new double[]{lat, lon};

        } catch (Exception e) {
            System.err.println("Error trying to get the coords from: " + address);
            System.err.println("Error message: " + e.getMessage());
            return new double[]{0.0, 0.0};
        }
    }
}
