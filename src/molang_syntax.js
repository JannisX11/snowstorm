Prism.languages.molang = {
	'string': {
		pattern: /"(?:[^"\r\n]|"")*"(?!")/,
		greedy: true
    },
    'accessor': /\b(?!\d)(query|variable|temp)\.\w+/i,
    'boolean': /\b(?:true|false)\b/i,
    'math-function': /\b(?!\d)math\.\w+(?=[\t ]*\()/i,
	'number': /(?:\b\d+(?:\.\d+)?(?:[ed][+-]\d+)?|&h[a-f\d]+)\b[%&!#]?/i,
	'operator': /--|\+\+|>>=?|<<=?|<>|[-+*/\\<>]=?|[:^=?]|\b(?:and|mod|not|or)\b/i,
	'punctuation': /[.,;()[\]{}]/,
};
