package lint.comments

import com.pinterest.ktlint.cli.ruleset.core.api.RuleSetProviderV3
import com.pinterest.ktlint.rule.engine.core.api.AutocorrectDecision
import com.pinterest.ktlint.rule.engine.core.api.Rule
import com.pinterest.ktlint.rule.engine.core.api.RuleAutocorrectApproveHandler
import com.pinterest.ktlint.rule.engine.core.api.RuleId
import com.pinterest.ktlint.rule.engine.core.api.RuleProvider
import com.pinterest.ktlint.rule.engine.core.api.RuleSetId
import org.jetbrains.kotlin.com.intellij.lang.ASTNode
import org.jetbrains.kotlin.lexer.KtTokens
import org.jetbrains.kotlin.psi.KtDeclaration
import org.jetbrains.kotlin.psi.KtDeclarationWithBody
import org.jetbrains.kotlin.psi.KtFunctionLiteral

/** Register the comments rule with the consuming project's ktlint runtime. */
class CommentRules : RuleSetProviderV3(RuleSetId("comments")) {
    override fun getRuleProviders(): Set<RuleProvider> = setOf(RuleProvider(::NoBodyComments))
}

/** Diagnose loose comments in function bodies and lambdas without editing source. */
private class NoBodyComments :
    Rule(RuleId("comments:no-body-comments"), About()),
    RuleAutocorrectApproveHandler {
    private companion object {
        val legalMarker: Regex =
            Regex(
                """^(?:SPDX-(?:License-Identifier|FileCopyrightText):|copyright\b[ \t]*:?[ \t]*(?:[0-9]{4}\b|©|\(c\))|©)""",
                RegexOption.IGNORE_CASE,
            )
    }

    override fun beforeVisitChildNodes(
        node: ASTNode,
        emit: (offset: Int, errorMessage: String, canBeAutoCorrected: Boolean) -> AutocorrectDecision,
    ) {
        val text =
            when (node.elementType) {
                KtTokens.EOL_COMMENT -> node.text.removePrefix("//")
                KtTokens.BLOCK_COMMENT, KtTokens.DOC_COMMENT -> node.text.removePrefix("/*")
                else -> return
            }.removeSuffix("*/").trimStart { it.isWhitespace() || it == '*' || it == '!' }.trimEnd()
        if (node.elementType == KtTokens.DOC_COMMENT && node.treeParent.psi is KtDeclaration) {
            return
        }
        if (
            legalMarker.containsMatchIn(text) ||
            text.startsWith("language=") ||
            text.startsWith("noinspection ") ||
            text.startsWith("region ") ||
            text == "endregion" ||
            text == "@formatter:on" ||
            text == "@formatter:off" ||
            text == "ktlint-disable" ||
            text.startsWith("ktlint-disable ") ||
            text == "ktlint-enable" ||
            text.startsWith("ktlint-enable ")
        ) {
            return
        }
        val inBody =
            generateSequence(node) { it.treeParent }.zipWithNext().any { (child, parent) ->
                val owner = parent.psi
                owner is KtFunctionLiteral ||
                    (owner is KtDeclarationWithBody && owner.bodyExpression?.node == child)
            }
        if (inBody) {
            emit(
                node.startOffset,
                "Remove dead code and workaround notes. Fix the underlying code or document the contract at its declaration.",
                false,
            )
        }
    }
}
