object TrailingComma {
    fun combine(
        first: String,
        second: String
    ): String = first + second

    fun label(): String =
        combine(
            "North",
            "South"
        )
}
