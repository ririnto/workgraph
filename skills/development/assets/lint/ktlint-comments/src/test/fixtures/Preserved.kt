/** Public function contract. */
fun preserved() {
    // SPDX-License-Identifier: MIT
    val commentText = "// not a Kotlin comment"

    // language=JSON
    val json = """{"hello":"world"}"""
    println(commentText + json)
}
