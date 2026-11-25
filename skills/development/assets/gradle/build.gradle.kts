import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jlleitschuh.gradle.ktlint.reporter.ReporterType
import java.net.JarURLConnection

plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.ktlint)
}

val provider = checkNotNull(javaClass.classLoader.getResource("lint/rules/LintRules.class"))
val archive = provider.openConnection() as JarURLConnection

dependencies {
    ktlintRuleset(files(archive.jarFileURL.toURI()))
}

java {
    sourceCompatibility = JavaVersion.VERSION_21
    targetCompatibility = JavaVersion.VERSION_21
}

kotlin {
    compilerOptions.jvmTarget.set(JvmTarget.JVM_21)
}

ktlint {
    version.set(libs.versions.ktlint.engine)
    reporters {
        reporter(ReporterType.PLAIN)
        reporter(ReporterType.JSON)
    }
}
