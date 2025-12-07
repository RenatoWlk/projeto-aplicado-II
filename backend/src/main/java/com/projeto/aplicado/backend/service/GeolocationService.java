package com.projeto.aplicado.backend.service;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Optional;

@Service
public class GeolocationService {
    private static final Logger logger = LoggerFactory.getLogger(GeolocationService.class);

    private final HttpClient httpClient;

    // retry configuration
    private static final int MAX_ATTEMPTS = 5;
    private static final long BASE_BACKOFF_MS = 500L; // base backoff for exponential strategy

    public GeolocationService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    /**
     * Retrieves geographical coordinates (latitude and longitude) from a given address string
     * using the Nominatim API (OpenStreetMap).
     * If the lookup fails after retries, returns {0.0, 0.0}.
     */
    public double[] getCoordinatesFromAddress(String address) {
        String encodedAddress = URLEncoder.encode(address, StandardCharsets.UTF_8);
        String url = "https://nominatim.openstreetmap.org/search?format=json&q=" + encodedAddress;

        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .header("User-Agent", "QuatroVidas/1.0 (suporte4vidas@gmail.com)")
                        .header("Accept-Language", "pt-BR")
                        .timeout(Duration.ofSeconds(10))
                        .GET()
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                int status = response.statusCode();

                // handle 200 OK
                if (status == 200) {
                    JSONArray jsonArray = new JSONArray(response.body());

                    if (jsonArray.isEmpty()) {
                        // no results — not transient; do not retry
                        logger.info("No coordinates found for address: {}", address);
                        return new double[]{0.0, 0.0};
                    }

                    JSONObject location = jsonArray.getJSONObject(0);
                    double lat = Double.parseDouble(location.getString("lat"));
                    double lon = Double.parseDouble(location.getString("lon"));
                    return new double[]{lat, lon};
                }

                // handle rate limiting (Retry-After)
                if (status == 429) {
                    long waitMs = extractRetryAfterMillis(response).orElse(computeBackoffMs(attempt));
                    logger.warn("Received 429 from Nominatim. Attempt {}/{}. Waiting {} ms before retry.", attempt, MAX_ATTEMPTS, waitMs);
                    sleepMillis(waitMs);
                    continue;
                }

                // retry on server errors (5xx)
                if (status >= 500 && status < 600) {
                    long backoff = computeBackoffMs(attempt);
                    logger.warn("Server error {} from Nominatim. Attempt {}/{}. Backing off {} ms.", status, attempt, MAX_ATTEMPTS, backoff);
                    sleepMillis(backoff);
                    continue;
                }

                // other client errors (4xx except 429) or unexpected codes: do not retry
                logger.error("Unexpected response status {} from Nominatim for address '{}'. Body: {}", status, address, safeBodySnippet(response.body()));
                return new double[]{0.0, 0.0};
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                logger.error("Thread interrupted while getting coordinates for '{}'", address, ie);
                return new double[]{0.0, 0.0};
            } catch (Exception e) {
                // network errors, parsing errors, etc. -> retry unless last attempt
                if (attempt == MAX_ATTEMPTS) {
                    logger.error("Failed to get coordinates for '{}' after {} attempts.", address, MAX_ATTEMPTS, e);
                    return new double[]{0.0, 0.0};
                } else {
                    long backoff = computeBackoffMs(attempt);
                    logger.warn("Error on attempt {}/{} getting coordinates for '{}': {}. Retrying after {} ms.",
                            attempt, MAX_ATTEMPTS, address, e.getMessage(), backoff);
                    sleepMillis(backoff);
                }
            }
        }

        // should not reach here, but return default just in case
        return new double[]{0.0, 0.0};
    }

    private static long computeBackoffMs(int attempt) {
        // exponential backoff with cap
        long backoff = BASE_BACKOFF_MS * (1L << (attempt - 1));
        long maxBackoff = 10_000L;
        return Math.min(backoff, maxBackoff);
    }

    private static void sleepMillis(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }

    private static Optional<Long> extractRetryAfterMillis(HttpResponse<?> response) {
        return response.headers().firstValue("Retry-After").flatMap(value -> {
            try {
                // Retry-After may be seconds or HTTP-date; try parse as seconds first
                long seconds = Long.parseLong(value.trim());
                return Optional.of(seconds * 1000L);
            } catch (NumberFormatException nfe) {
                // fallback: ignore HTTP-date parsing complexity and return empty
                return Optional.empty();
            }
        });
    }

    private static String safeBodySnippet(String body) {
        if (body == null) return "";
        return body.length() > 500 ? body.substring(0, 500) + "..." : body;
    }
}
