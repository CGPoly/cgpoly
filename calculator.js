/**
 * Splits the string in meaningful units (lexical analysis).\n
 * Splits at the symbols: \n \t ' '   + - * / ^ ( ) ,
 * @param {String} string the string that should be tokenized
 * @return {String[]} the tokens of string as a list
 */
function tokenizer(string) {
    const stop = [' ', '+', '-', '*', '/', '^', '(', ')', ',']
    let tokens = []
    let is_num = false
    let t_start = 0
    let t_length = 0
    for (let i = 0; i < string.length; i++) {
        if (stop.includes(string[i])) {
            is_num = false
            if (t_length > 0) {
                tokens.push(string.slice(t_start, i))
                if (string[i] !== ' ') tokens.push(string[i])
                t_start = i + 1
                t_length = 0
            } else {
                if (string[i] !== ' ') tokens.push(string[i])
                t_start += 1
            }
        } else {
            t_length += 1
            if (isNaN(Number(string.slice(t_start, i + 1)))) {
                if (is_num) {
                    is_num = false
                    tokens.push(string.slice(t_start, i))
                    tokens.push("*")
                    t_start = i
                    t_length = 0
                    i-=1
                    continue
                }
            }
            else is_num = true
            if (i === string.length - 1) tokens.push(string.slice(t_start, i + 1))
        }
    }
    return tokens
}


/**
 * creates an expression of an given token list.
 * @param {String[]} tokens the list of tokens
 * @return {Expression} the Expression
 */
function parser(tokens) {
    return Expression.parse(tokens).call()
}

/**
 * translates an string into an Expression
 * @param {string} string the string, that should be translated
 * @return {Expression} the Expression of that string
 */
function translate(string) {
    return parser(tokenizer(string))
}

/**
 * does some formatting of a string
 * removes unneeded parentheses and merges plus and minus
 * @param {string} res the string that should be formatted
 * @return {string} the formatted string
 */
function polish_str(res) {
    let tmp = res.indexOf("-")
    if (tmp !== -1) {
        let minus = [tmp]
        while (tmp !== -1) {
            if (minus[minus.length - 1] + 1 > res.length - 1) break
            tmp = res.indexOf("-", minus[minus.length - 1] + 1)
            minus.push(tmp)
        }
        minus.pop()
        let c = 0
        minus.forEach(i => {
            if (i >= 1) {
                if (i === 1 && res[i - 1 - c] === "(" || (res[i - 1 - c] === "(" === res[i - 2 - c])) {
                    for (let k = 0; k < res.length; k++) {
                        if (res[k] === ")") {
                            res = res.slice(0, i - 1 - c) + res.slice(i - c, k) + res.slice(k + 1)
                            c += 2
                            break
                        }
                        else if (!(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-", ".", "e"].includes(res[k])))
                            break
                    }
                } else if (i - c > 3 && res[i - c - 1] === "(" && res[i - c - 3] === "+") {
                    for (let k = i; k < res.length; k++) {
                        if (res[k] === ")") {
                            res = res.slice(0, i - 3 - c) + "-" + res.slice(i - 2 - c, i - 1 - c) +
                                res.slice(i - c + 1, k) + res.slice(k + 1);
                            c += 2
                            break
                        }
                        else if (!(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-", ".", "e"].includes(res[k])))
                            break
                    }
                }
            }
        })
    }
    return res
}

/**
 * A class that stores expressions
 */
class Expression{
    /**
     * creates a member of the class Expression
     * @param {boolean} plus true if this Expression is added onto another Expression, false if it is subtracted
     */
    constructor(plus) {
        this.plus = plus
        this.next = null
        this.term = null
    }

    /**
     * Adds an Expression onto this Expression
     * Adds onto the next expression, if there is a next one
     * @param {Expression} other is the Expression added or subtracted
     */
    add(other) {
        if (this.next === null) this.next = other
        else this.next.add(other)
    }

    /**
     * translates a list of tokens to an Expression
     * @param {String[]} tokens the list of Tokens
     * @return {Expression} the corresponding Expression
     */
    static parse(tokens){
        let tmp = [new Expression(true)]
        tmp[0].term = Term.parse(tokens)
        if (tokens.length === 0) return tmp[0]
        let t = tokens[0]
        while (tokens.length > 0 && (t === "+" || t === "-")){
            tokens.shift()
            tmp.push(new Expression(t==="+"))
            tmp[tmp.length-1].term = Term.parse(tokens)
            if (tokens.length > 0){
                t = tokens[0]
            }
        }
        tmp.slice(1).forEach(i => tmp[0].add(i))
        return tmp[0]
    }

    /**
     * calls the Expression
     * @param {Object} kwargs the variables, which should be replaced
     * @return {null|Expression|Complex|Term} the new Expression / the resulting complex number
     */
    call(kwargs={}){
        let ter = this.term.call(kwargs)
        let nex = null
        if (this.next !== null) nex = this.next.call(kwargs)
        if (ter instanceof Term) {
            let res = new Expression(this.plus)
            res.term = ter
            if (nex != null){
                if (nex instanceof  Expression) res.next = nex
                else if (nex instanceof  Complex) res.next = Expression.apply_val(nex)
                else throw "unexpected Type"
            }
            return res
        }
        if (!ter instanceof Complex) throw "unexpected Type"
        if (nex !== null){
            if (nex instanceof Expression){
                if (ter === 0){
                    if (!this.plus) nex.term.positive = !nex.term.positive
                    return nex
                }
                let res = Expression.apply_val(ter)
                res.next = nex
                return res
            }
            else if (nex instanceof Number || nex instanceof Complex){
                if (this.next.plus) ter.add(nex)
                else ter.sub(nex)
            }
            else throw "unexpected Type"
        }
        return ter
    }

    /**
     * creates an expression consisting of an single value
     * @param val the value
     * @return {Expression} the resulting Expression
     */
    static apply_val(val){
        let tmp = new Expression(true)
        tmp.term = Term.apply_val(val)
        return tmp
    }

    /**
     * the string representation of the Expression
     * @return {string} the polished string representation
     */
    toString(){
        return polish_str(this.str)
    }

    /**
     * the string representation of the Expression
     * @return {string} the string representation
     */
    get str(){
        let tmp = this.term.str
        let pivot = this
        while (pivot.next !== null){
            pivot = pivot.next
            if (pivot.plus) tmp += " + " + pivot.term.str
            else tmp += " - " + pivot.term.str
        }
        return tmp
    }

    get copy(){
        let tmp = new Expression(this.plus)
        if (this.next !== null) tmp.next = this.next.copy
        tmp.term = this.term.copy
        return tmp
    }
}

/**
 * A class that stores Terms
 */
class Term{
    /**
     * creates a member of the class Term
     * @param {boolean} multiply true if this Expression is multiplied onto another Expression, false if it is divided
     */
    constructor(multiply) {
        this.multiply = multiply
        this.next = null
        this.factor = null
    }

    /**
     * Multiplies an Expression onto this Expression
     * Multiplies onto the next expression, if there is a next one
     * @param {Term} other
     */
    mul(other){
        if (this.next == null) this.next = other
        else this.next.mul(other)
    }

    /**
     * parses an array of tokens to an Term object
     * @param {String[]} tokens the array of tokens
     * @return {Term} the parsed Term object
     */
    static parse(tokens){
        let tmp = [new Term(true)]
        tmp[0].factor = Factor.parse(tokens)
        if (tokens.length === 0) return tmp[0]
        let t = tokens[0]
        while (tokens.length > 0 && (t === "*" || t === "/")){
            tokens.shift()
            tmp.push(new Term(t === "*"))
            tmp[tmp.length-1].factor = Factor.parse(tokens)
            if (tokens.length > 0) t = tokens[0]
        }
        tmp.slice(1).forEach(i=>tmp[0].mul(i))
        return tmp[0]
    }

    /**
     * calls the Term
     * @param {object} kwargs the variables, which should be replaced
     * @return {null|Expression|Complex|Term} the new Expression / the resulting complex number
     */
    call(kwargs={}){
        let fac = this.factor.call(kwargs)
        let nex = null
        if (this.next !== null) nex = this.next.call(kwargs)
        if (fac instanceof Factor) {
            let res = new Term(this.multiply)
            res.factor = fac
            if (nex !== null){
                if (nex instanceof Term) res.next = nex
                else if (nex instanceof Complex) res.next = Term.apply_val(nex)
                else throw "unexpected Type"
            }
            return res
        }
        if (!(fac instanceof Complex)) throw "unexpected Type"
        if (nex !== null){
            if (nex instanceof Term){
                let res = Term.apply_val(fac)
                res.next = nex
                return res
            }
            else if (nex instanceof Complex){
                if (this.next.multiply) fac.mul(nex)
                else fac.div(nex)
            }
            else throw "unexpected Type"
        }
        return fac
    }

    /**
     * creates an Term consisting of an single value
     * @param val the value
     * @return {Term} the resulting Term
     */
    static apply_val(val){
        let tmp = new Term(true)
        tmp.factor = Factor.apply_val(val)
        return tmp
    }

    /**
     * the polished string representation
     * @return {string} the polished string representation
     */
    toString(){
        return polish_str(this.str)
    }

    /**
     * the string representation
     * @return {string} the string representation
     */
    get str(){
        let tmp = this.factor.str
        if (this.next !== null){
            if (this.next.multiply) tmp += "*"
            else tmp += "/"
            tmp += this.next.str
        }
        return tmp
    }

    get copy(){
        let tmp = new Term(this.mul)
        if (this.next !== null) tmp.next = this.next.copy
        tmp.factor = this.factor.copy
        return tmp
    }
}

class Factor{
    /**
     * constructs an Factor object
     * @param {boolean} positive is the sign of the factor positive or negative
     */
    constructor(positive) {
        this.positive = positive
        this.item = null
        this.exponent = null
    }

    /**
     * parses an array of tokens to an Factor object
     * @param {String[]} tokens the token array
     * @return {Factor} the parsed factor object
     */
    static parse(tokens){
        let res = new Factor(true)
        if (tokens[0] === "+") tokens.shift()
        else if (tokens[0] === "-"){
            tokens.shift()
            res.positive = false
        }
        res.item = Item.parse(tokens)
        if (tokens.length > 0 && tokens[0] === "^"){
            tokens.shift()
            res.exponent = Factor.parse(tokens)
        }
        return res
    }

    /**
     * calls the Factor
     * @param {Object} kwargs the variables, which should be replaced
     * @return {Factor|Complex} the new Expression / the resulting complex number
     */
    call(kwargs={}){
        let item = this.item.call(kwargs)
        let expo = null
        if (this.exponent !== null) expo = this.exponent.call(kwargs)
        if (item instanceof Item) {
            let res = new Factor(this.positive)
            res.item = item
            if (expo !== null){
                if (expo instanceof Factor) res.exponent = expo
                else if (expo instanceof Complex) res.exponent = Factor.apply_val(expo)
                else throw "unexpected Type"
            }
            return res
        }
        if (!(item instanceof Complex)) throw "unexpected Type"
        if (!this.positive) item.mul(-1)
        if (expo !== null){
            if (expo instanceof Factor){
                let res = Factor.apply_val(item)
                res.exponent = expo
                return res
            }
            else if (expo instanceof Complex) item.pow(expo)
            else throw "unexpected Type"
        }
        return item
    }

    /**
     * creates an Factor consisting of an single value
     * @param val the value
     * @return {Factor} the resulting Factor
     */
    static apply_val(val){
        let res = new Factor(true)
        if (!val instanceof Complex && val < 0){
            res.positive = false
            val.mul(-1)
        }
        let tmp = new Item(0)
        tmp.value = val
        res.item = tmp
        return res
    }

    toString(){
        return this.str
    }

    get str(){
        let res = this.item.str
        if (!this.positive) res = "(-" + res + ")"
        if (this.exponent !== null) res += "^" + this.exponent.str
        return res
    }

    get copy(){
        let tmp = new Factor(this.positive)
        if (this.exponent !== null) tmp.exponent = this.exponent.copy
        tmp.item = this.item.copy
        return tmp
    }
}

/**
 * A class for saving and processing Items (reference syntax diagramm)
 */
class Item{
    static variables = {
        "pi": new Complex(Math.PI, 0),
        "e": new Complex(Math.E, 0),
        "i": new Complex(0, 1)
    }

    constructor(kind) {
        this.kind = kind //0: Number; 1: ( Expression ); 2: Variable; 3: Function
        switch (this.kind){
            case 0:
                this.value = 0
                break
            case 1:
            case 3:
                this.value = null
                break
            case 2:
                this.value = ""
                break
            default:
                throw "unknown kind"
        }
    }

    /**
     * defines or redefines an variable
     * @param {string} name the name of the variable
     * @param {Complex|Expression|String|Number} value the value, that the variable should get
     */
    static define(name, value){
        if (typeof value === "number") value = new Complex(value,0)
        if (typeof value === "string") value = translate(value)
        Item.variables[name] = value
    }

    /**
     * parses an array of tokens to an Item object
     * @param {String[]} tokens the array of tokens
     * @return {Item} the resulting Item object
     */
    static parse(tokens){
        if (isNaN(Number(tokens[0]))){
            if (Complex.check_complex(tokens[0])){
                let tmp = new Complex(tokens.shift())
                let res = new Item(0)
                res.value = tmp
                return res
            }
            else if (tokens[0] === "(") {
                tokens.shift()
                let index = Item.findParenthesis(tokens)
                if (index === -1) throw "unmatched Parenthesis"
                let res = new Item(1)
                res.value = Expression.parse(tokens.slice(0, index))
                tokens.splice(0, index+1)
                return res
            }
            else if (tokens[0] === ")") throw "unmatched Parenthesis"
            else if (tokens.length > 1 && tokens[1] === "("){
                let res = new Item(3)
                let name = tokens.shift()
                tokens.shift()
                let index = Item.findParenthesis(tokens)
                if (index === -1) throw "unmatched Parenthesis"
                res.value = Func.parse(name, tokens.slice(0, index))
                tokens.splice(0, index+1)
                return res
            }
            let res = new Item(2)
            res.value = tokens.shift()
            return res
        }
        else {
            let tmp = new Complex(parseFloat(tokens.shift()), 0)
            let res = new Item(0)
            res.value = tmp
            return res
        }
    }

    /**
     * finds the matching parenthesis. Assumes, that the start parenthesis is already removed
     * @param tokens the array of tokens, without the start parenthesis
     * @return {number} the index of the end parenthesis. this is -1 if no end is found
     */
    static findParenthesis(tokens){
        let parenthesis = 1
        for (let i = 0; i < tokens.length; i++){
            if (tokens[i] === "(") parenthesis++
            else if (tokens[i] === ")") parenthesis--
            if (parenthesis === 0) return i
        }
        return -1
    }

    /**
     * copys the current Item
     * @return {Item} the copy
     */
    get copy(){
        let tmp = new Item(this.kind)
        if (["string", "number"].includes(typeof this.value)) tmp.value = this.value
        else tmp.value = this.value.copy
        return tmp
    }

    /**
     * calls the Item
     * @param {Object} kwargs an dictionary with variables, that should be replaced
     * @return {Complex|Item}
     */
    call(kwargs={}){
        kwargs = Object.assign({}, kwargs, Item.variables)
        if (this.kind === 0) return this.value.copy
        else if (this.kind === 1){
            let tmp = this.value.call(kwargs).copy
            if (tmp instanceof Complex) return tmp
            let res = new Item(1)
            res.value = tmp
            return res
        }
        else if (this.kind === 2) {
            if (this.value in kwargs) {
                if (kwargs[this.value] instanceof Complex) return kwargs[this.value].copy
                else if (typeof kwargs[this.value] === "number") return new Complex(kwargs[this.value].copy, 0)
                else if (kwargs[this.value] instanceof Expression) {
                    let tmp = new Item(1)
                    tmp.value = kwargs[this.value].copy
                    tmp.call(kwargs)
                    return tmp
                }
                else throw "unknown type"
            }
            else return this.copy
        }
        else if (this.kind === 3) {
            let tmp = this.value.call(kwargs)
            if (tmp instanceof Func) {
                let res = new Item(this.kind)
                res.value = tmp
                return res
            }
            if (tmp instanceof Expression){
                let res = new Item(1)
                res.value = tmp
                return res
            }
            return tmp
        }
        else throw "unknown kind"
    }

    toString(){
        return polish_str(this.str)
    }

    get str(){
        if (this.kind === 1){
            if (this.value === null) return ""
            return "(" + this.value.str + ")"
        }
        return this.value.toString()
    }
}

/**
 * A class for saving and processing functions
 */
class Func{
    /**
     * an static dictionary, that keeps track of all defined function
     * each entry has following scheme:
     * "name": [numberOfVariables, FunctionAsLambdaExpression, ["varName1", ..., "varNameN"]]
     * @type {Object}
     */
    static defined = {
        "sin": [1, (x)=>new Complex(Math.sin(x), 0), ["x"]],
        "cos": [1, (x)=>new Complex(Math.cos(x), 0), ["x"]],
        "tan": [1, (x)=>new Complex(Math.tan(x), 0), ["x"]]
    }

    /**
     * the constructor of the Func class
     * @param {string} name
     */
    constructor(name) {
        this.name = name
        this.vars = []
    }

    get copy(){
        let tmp = new Func(this.name)
        tmp.vars = this.vars.copy
        return tmp
    }

    /**
     * puts var_names and values into an dict, to translate them to call
     * @param {String[]} var_names the names of the variables
     * @param values the values of the variables
     * @return {Object} the resulting dict
     */
    static translate(var_names, values){
        if (values.length !== var_names.length) {
            throw "length not fitting"
        }
        let res = {}
        for (let i = 0; i < var_names.length; i++) res[var_names[i]] = values[i]
        return res
    }

    /**
     * defines a new function
     * @param {String} name the name of the function
     * @param {String[]} var_names the names of the inputs of the function
     * @param {Expression} func the math behind the function
     */
    static define(name, var_names, func) {
        if ((new Set(var_names)).size !== var_names.length) throw "no duplicates are allowed"
        Function.defined[name] = [var_names.length, (args => func.call(Func.translate(var_names, args))), var_names]
    }

    /**
     * parses an function object
     * @param {String} name
     * @param {String[]} variables
     * @return {Func}
     */
    static parse(name, variables){
        let res = new Func(name)
        while (variables.length > 0){
            let index = variables.indexOf(",")
            if (index === -1) res.vars.push(Expression.parse(variables).call())
            else {
                res.vars.push(Expression.parse(variables.slice(index)).call())
                variables.shift()
                // Dieser Teil löscht möglicherweise zu wenig
            }
        }
        return res
    }

    /**
     * calls an function object. this uses the already defined functions as reference
     * @param {Object} kwargs the variables, that should be replaced.
     * @return
     */
    call(kwargs={}){
        let pack = []
        this.vars.forEach(i => pack.push(i.copy))
        let allNum = true
        for (let i = 0; i < pack.length; i++) {
            pack[i] = pack[i].call(kwargs)
            if (pack[i] instanceof Expression) allNum = false
        }
        if (allNum && this.name in Func.defined && this.vars.length === Func.defined[this.name][0])
            return Func.defined[this.name][1](pack)
        let res = new Func(this.name)
        res.vars = pack
        return res
    }

    toString(){
        return this.str
    }

    get str(){
        let res = this.name + "("
        this.vars.forEach(i=>res+=i.toString()+", ")
        return res.slice(0, -2) + ")"
    }
}
