import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    alias(libs.plugins.kotlin.jvm)
}

repositories {
    mavenCentral()
}

val ktlintVersion = providers.gradleProperty("ktlintVersion").get()

dependencies {
    compileOnly(platform("com.pinterest.ktlint:ktlint-bom:$ktlintVersion"))
    compileOnly("com.pinterest.ktlint:ktlint-cli-ruleset-core")
    compileOnly("com.pinterest.ktlint:ktlint-rule-engine-core")
}

java {
    sourceCompatibility = JavaVersion.VERSION_21
    targetCompatibility = JavaVersion.VERSION_21
}

kotlin {
    compilerOptions.jvmTarget.set(JvmTarget.JVM_21)
}
