package lint.rules

import com.pinterest.ktlint.cli.ruleset.core.api.RuleSetProviderV3
import com.pinterest.ktlint.rule.engine.core.api.RuleProvider
import com.pinterest.ktlint.rule.engine.core.api.RuleSetId

/** Register the local rules with the consuming project's ktlint runtime. */
class LintRules : RuleSetProviderV3(RuleSetId("comments")) {
    override fun getRuleProviders(): Set<RuleProvider> = setOf(RuleProvider(::NoBodyComments))
}
