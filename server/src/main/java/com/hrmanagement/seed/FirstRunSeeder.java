package com.hrmanagement.seed;

import com.hrmanagement.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("!seed")
public class FirstRunSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(FirstRunSeeder.class);

    private final UserRepository userRepository;
    private final DataSeeder dataSeeder;

    public FirstRunSeeder(UserRepository userRepository, DataSeeder dataSeeder) {
        this.userRepository = userRepository;
        this.dataSeeder = dataSeeder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Seed skipped: database already has data");
            return;
        }
        log.info("Empty database detected - seeding sample data on first run");
        dataSeeder.seed();
    }
}
