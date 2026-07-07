package com.hrmanagement.app;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@Disabled("Requires MySQL running on localhost:3306")
class AppApplicationTests {

    @Test
    void contextLoads() {
    }
}
