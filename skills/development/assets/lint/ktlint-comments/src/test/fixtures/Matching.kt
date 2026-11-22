fun matching() {
    // Workaround note inside a function body.
    println("outside")
    listOf(1).forEach {
        /*
         * Workaround note inside a lambda.
         */
        println(it)
    }
}
