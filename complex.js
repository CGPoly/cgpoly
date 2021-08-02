/**
 * An Class to save and calculate complex numbers
 */
class Complex {
    /**
     * the constructor for the complex numbers
     * @param {string|number} value if no imaginary value is given, this could be a string, which is than parsed to an
     * complex number. It could also be an Number, which is than passed as the reel value or the radius.
     * @param {null|number} imaginary if this is not null, this is the imaginary value or the angle
     * @param {boolean} polar this determines, if the input (if given as two numbers) is given in cartesian or
     * polar coordinate space
     */
    constructor(value, imaginary=null, polar=false) {
        let parseImaginary = function(str){
            if (str[0] === "i") {
                if (str.slice(1).length === 0) return 1
                if (str[1] === "*") return parseFloat(str.slice(2))
                return parseFloat(str.slice(1))
            }
            if (str[-1] === "i") {
                if (str.slice(0, -1).length === 0) return 1
                if (str[-2] === "*") return parseFloat(str.slice(0, -2))
                return parseFloat(str.slice(0, -1))
            }
            throw "The input is not an complex number"
        }
        let re = NaN
        let im = NaN
        if (typeof value === "string" && imaginary === null){
            value = value.replace(/\s+/g, '');
            if (value.includes("+")){
                let val_l = value.split("+")
                if (val_l.length > 2) throw "The input is not an complex number"
                if (val_l[0].includes("i")){
                    re = parseFloat(val_l[1])
                    im = parseImaginary(val_l[0])
                }
                if (val_l[1].includes("i")){
                    re = parseFloat(val_l[0])
                    im = parseImaginary(val_l[1])
                }
            }
            else {
                if (value.includes("i")){
                    re = 0
                    im = parseImaginary(value)
                }
                else {
                    re = parseFloat(value)
                    im = 0
                }
            }
        }
        else if (typeof value === "number" && typeof imaginary === "number"){
            if (polar){
                re = value*Math.cos(imaginary)
                im = value*Math.sin(imaginary)
            }
            else {
                re = value
                im = imaginary
            }
        }
        else throw "Unidentifiable input "
        this.re = re
        this.im = im
    }

    get copy(){
        return new Complex(this.re, this.im)
    }

    /**
     * checks if an given string is parsable to an complex number
     * @param {String} value the string, that should be checked
     * @return {boolean} true <=> if the number is parseable
     */
    static check_complex(value){
        let checkImaginary = function(str){
            let tmp = NaN
            if (str[0] === "i") {
                if (str.slice(1).length === 0) return true
                if (str[1] === "*") tmp = Number(str.slice(2))
                else tmp = Number(str.slice(1))
            }
            if (str[-1] === "i") {
                if (str.slice(0, -1).length === 0) return true
                if (str[-2] === "*") tmp = Number(str.slice(0, -2))
                else tmp = Number(str.slice(0, -1))
            }
            return !isNaN(tmp)
        }
        value = value.replace(/\s+/g, '');
        if (value.includes("+")){
            let val_l = value.split("+")
            if (val_l.length > 2) throw "The input is not an complex number"
            if (val_l[0].includes("i")) return checkImaginary(val_l[0])
            if (val_l[1].includes("i")) return checkImaginary(val_l[1])

        }
        else {
            if (value.includes("i")) return checkImaginary(value)
            else return !isNaN(Number(value))
        }
    }

    /**
     * casts the complex number to an string
     * @return {string} the string representation
     */
    toString() {
        if (this.im === 0) return this.re.toString()
        if (this.re === 0) return this.im.toString() + "i"
        return this.re.toString() + " + " + this.im.toString() + "i"
    }

    /**
     * adds another number onto this one
     * @param {string, number, Complex} num the other number
     */
    add(num) {
        if (typeof num === "number") this.re += num
        else if (typeof num === "string") this.add(new Complex(num))
        else if (num instanceof Complex){
            this.re += num.re
            this.im += num.im
        }
        else throw "unknown type of num"
    }

    /**
     * subtracts another number off this one
     * @param {string|number|Complex} num the other number
     */
    sub(num) {
        if (typeof num === "number") this.re -= num
        else if (typeof num === "string") this.add(new Complex(num))
        else if (num instanceof Complex){
            this.re -= num.re
            this.im -= num.im
        }
        else throw "unknown type of num"
    }

    /**
     * multiplies another number onto this one
     * @param {string|number|Complex} num the other number
     */
    mul(num) {
        if (typeof num === "number") {
            this.re *= num
            this.im *=num
        }
        else if (typeof num === "string") this.mul(new Complex(num))
        else if (num instanceof Complex) {
            this.re = this.re*num.re - this.im*num.im
            this.im = this.re*num.im+this.im*num.re
        }
        else throw "unknown type of num"
    }

    /**
     * divides this number through the given one
     * @param {string|number|Complex} num the given number
     */
    div(num){
        if (typeof num === "number"){
            this.re /= num
            this.im /= num
        }
        else if (typeof num === "string") this.div(new Complex(num))
        else if (num instanceof Complex) {
            this.re = (this.re*num.re+this.im*num.im)/(num.re*num.re+num.im*num.im)
            this.im = -(this.re*num.im+this.im*num.re)/(num.re*num.re+num.im*num.im)
        }
        else throw "unknown type of num"
    }

    /**
     * adds two numbers and returns the result
     * @param {string, number, Complex} num1 the first number
     * @param {string, number, Complex} num2 the second number
     * @return {number|Complex} the result
     */
    static add(num1, num2) {
        if (typeof num1 === "string") num1 = new Complex(num1)
        else if (typeof num1 === "number") num1 = new Complex(num1, 0)
        else if (!num1 instanceof Complex) throw "unknown type of num1"
        num1.add(num2)
        return num1
    }

    /**
     * subtracts two numbers and returns the result
     * @param {string, number, Complex} num1 the first number
     * @param {string, number, Complex} num2 the second number
     * @return {number|Complex} the result
     */
    static sub(num1, num2) {
        if (typeof num1 === "string") num1 = new Complex(num1)
        else if (typeof num1 === "number") num1 = new Complex(num1, 0)
        else if (!num1 instanceof Complex) throw "unknown type of num1"
        num1.sub(num2)
        return num1
    }

    /**
     * multiplies two numbers and returns the result
     * @param {string, number, Complex} num1 the first number
     * @param {string, number, Complex} num2 the second number
     * @return {number|Complex} the result
     */
    static mul(num1, num2) {
        if (typeof num1 === "string") num1 = new Complex(num1)
        else if (typeof num1 === "number") num1 = new Complex(num1, 0)
        else if (!num1 instanceof Complex) throw "unknown type of num1"
        num1.mul(num2)
        return num1
    }

    /**
     * divides two numbers and returns the result
     * @param {string, number, Complex} num1 the first number
     * @param {string, number, Complex} num2 the second number
     * @return {number|Complex} the result
     */
    static div(num1, num2) {
        if (typeof num1 === "string") num1 = new Complex(num1)
        else if (typeof num1 === "number") num1 = new Complex(num1, 0)
        else if (!num1 instanceof Complex) throw "unknown type of num1"
        num1.div(num2)
        return num1
    }

    /**
     * returns the radius of the complex number (= euclidean distance to 0+0i)
     * @return {number} the radius
     */
    get rad(){
        return Math.sqrt(this.re*this.re+this.im*this.im)
    }

    /**
     * returns the angle at which the complex number stands to the positive x-Axes
     * if the radius is equal to 0 (<=> this=0+0i), the angle is ambiguous and 0 is returned
     * @return {number} the angle phi
     */
    get phi(){
        if (this.re > 0) return Math.atan(this.im / this.re);
        if (this.re < 0 && (this.im > 0 || this.im === 0)) return Math.atan(this.im / this.re) + Math.PI;
        if (this.re < 0 && this.im < 0) return Math.atan(this.im / this.re) - Math.PI;
        if (this.re === 0 && this.im > 0) return Math.PI/2;
        if (this.re === 0 && this.im < 0) return -Math.PI/2;
        return 0;
    }

    /**
     * this function raises the complex number to an complex power using the polar coordinate space
     * @param {number|Complex|String} power the exponent
     */
    pow(power){
        let new_r
        let new_phi
        if (this.rad === 0) return
        if (typeof power === "number") {
            new_r = Math.pow(this.rad, power)
            new_phi = this.phi*power
        }
        else {
            if (typeof power === "string") power = new Complex(power)
            if (power instanceof Complex) {
                let phi = this.phi
                let r = this.rad
                new_r = Math.pow(r, power.re) * Math.exp(-power.im * phi)
                new_phi = power.im * Math.log(r) + phi * power.re
            }
            else throw "unknown type of power"
        }
        this.re = new_r*Math.cos(new_phi)
        this.im = new_r*Math.sin(new_phi)
    }

    /**
     * raises an complex number (base) to an complex power.
     * @param base the number that is used as an base
     * @param power the power
     * @return {Complex} the result
     */
    static pow(base, power){
        if (typeof base === "number") base = new Complex(base, 0)
        else if (typeof base === "string") base = new Complex(base)
        if (base instanceof Complex) {
            base.pow(power)
            return base
        }
        throw "unknown type of base"
    }
}