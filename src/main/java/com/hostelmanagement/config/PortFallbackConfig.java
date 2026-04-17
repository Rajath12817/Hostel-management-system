package com.hostelmanagement.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.net.ServerSocket;

@Configuration
public class PortFallbackConfig implements WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> {
    private final int preferredPort;

    public PortFallbackConfig(@Value("${server.port:8081}") int preferredPort) {
        this.preferredPort = preferredPort;
    }

    @Override
    public void customize(ConfigurableServletWebServerFactory factory) {
        if (preferredPort <= 0 || isAvailable(preferredPort)) {
            factory.setPort(preferredPort);
        } else {
            factory.setPort(0);
        }
    }

    private boolean isAvailable(int port) {
        try (ServerSocket socket = new ServerSocket(port)) {
            socket.setReuseAddress(true);
            return true;
        } catch (IOException exception) {
            return false;
        }
    }
}
