---
type: "tools"
title: "Dictionary"
---

<h1>Dictionary</h1>
<div id="lookup-result" style="display:none;"></div>
<input type="text" id="input-word" placeholder="... word here ..." maxlength="24" />
<button id="check-btn">Check!</button>     
<div id="footer">
    <span>Nouns? Use <strong>singular</strong> form. Also, col<strong>o</strong>r not col<strong>ou</strong>r.</span>
    <span>Verbs? Use <strong>infinitive</strong> form: "walk", "run", ... Analy<strong>z</strong>e not analy<strong>s</strong>e. Irregular verbs also include their other forms.</span>
    <span>This dictionary does not contain "all words". Only reasonable words most people would be expected to know or use.</span>
    <span>Missing a word? <a href="https://pandaqi.com/info/contact">Let me know</a></span>
</div>

<!-- Lazy loading of JS; A very, very tiny and specific piece of code for this dictionary -->
{{< load-assets-custom input="/js/pq_words/dictionary.ts" output="/js/lib-pqTools-dictionary.js" >}}
