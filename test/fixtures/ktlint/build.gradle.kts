import org.jlleitschuh.gradle.ktlint.reporter.ReporterType

plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.ktlint)
}

repositories {
    mavenCentral()
}

dependencies {
    if (providers.gradleProperty("useLocalRules").isPresent) {
        ktlintRuleset(files("lint/build/libs/lint-rules.jar"))
    }
}

ktlint {
    version.set(libs.versions.ktlint.engine)
    reporters {
        reporter(ReporterType.JSON)
    }
}
