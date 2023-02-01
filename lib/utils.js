import {langPack} from "../index.js";

const popupEl = document.getElementById("popup")

let popupTimer;

export function popupMessage(message, time=3000) {
    clearTimeout(popupTimer)
    popupEl.innerHTML = `<p>${message}</p>`
    popupEl.classList.add("alert")
    popupTimer = setTimeout(() => {
        popupEl.classList.remove("alert")
    }, time)
}

export function hidePopup() {
    popupEl.classList.remove("alert")
    clearTimeout(popupTimer)
}

export function isDigit(str) {
    for (let i = 0; i < str.length; i++)
        if (!['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(str.charAt(i)))
            return false
    return str.length > 0
}

export function numberInputHandler(event){
    let key = event.key
    if (['е', 'Е', 'E'].includes(key)) key = 'e'
    const val = event.target.value
    console.log(`
  Processing keydown event:
  1) Type = ${event.type},
  2) Value = ${val},
  3) Key = ${key}
  `)
    if (key === " ") {
        if (parseInt(event.target.cols, 10) + 2 === val.length)
            event.target.cols = parseInt(event.target.cols, 10) + 1
        return
    } else if (["r", "Alt", "Capslock", "Meta", "Shift", "Control", "Delete", "PageUp", "ArrowRight", "End", "PageDown"].includes(key))
        return
    let save = true
    let removeWarning = true
    let valWithoutSpaces = val.replaceAll(" ", "")
    if (key === "Tab") {
        return
    }
    event.preventDefault()
    console.log(`current value is ${val}, possible updated: ${val + key} = ${parseFloat(valWithoutSpaces + key)}`)
    let length = valWithoutSpaces.length
    const checkIntegerInput = () => {
        console.log(`Checking the integer ${valWithoutSpaces} of length ${length}, additional key = '${key}'`)
        if (valWithoutSpaces[0] === '-') {
            console.log("Negative")
            // negative integer
            if (length === 17) {
                if (key !== '') {
                    save = false
                    popupMessage(langPack["negative-int-restriction-text"])
                } else {
                    console.log("check if number is not too big")
                    let number = parseInt(valWithoutSpaces + key)
                    if (number < Number.MIN_SAFE_INTEGER) {
                        popupMessage(langPack["number-underflow-text"].replace("${}", "-9 007 199 254 740 991"))
                        event.target.classList.add("warning")
                        removeWarning = false
                    }
                }
            } else if (length === 16 && key !== '') {
                console.log("check if number is not too big")
                let number = parseInt(valWithoutSpaces + key)
                if (number < Number.MIN_SAFE_INTEGER) {
                    popupMessage(langPack["number-underflow-text"].replace("${}", "-9 007 199 254 740 991"))
                    event.target.classList.add("warning")
                    removeWarning = false
                }
            }
        } else {
            console.log("Positive")
            // positive integer
            if (length === 15 && key !== '') {
                console.log("check if number is not too big")
                let number = parseInt(valWithoutSpaces + key)
                if (number > Number.MAX_SAFE_INTEGER) {
                    popupMessage(langPack["number-overflow-text"].replace("${}", "9 007 199 254 740 991"))
                    event.target.classList.add("warning")
                    removeWarning = false
                }
            } else {
                if (key !== '') {
                    save = false
                    popupMessage(langPack["positive-int-restriction-text"])
                } else {
                    console.log("check if number is not too big")
                    let number = parseInt(valWithoutSpaces + key)
                    if (number > Number.MAX_SAFE_INTEGER) {
                        popupMessage(langPack["number-overflow-text"].replace("${}", "9 007 199 254 740 991"))
                        event.target.classList.add("warning")
                        removeWarning = false
                    }
                }
            }
        }
    }
    if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '+', '.', 'e'].includes(key)) {
        if (key === '.' && (valWithoutSpaces.includes('.') || valWithoutSpaces === '-' || length === 0) ||
            key === 'e' && (valWithoutSpaces.includes('e') || length === 0 || isNaN(valWithoutSpaces.charAt(length - 1))) ||
            (key === '+' || key === '-') && (length >= 1 && valWithoutSpaces.charAt(length - 1) !== 'e')) {
            popupMessage(langPack["enter-correct-number-text"], 1500)
            save = false
        } else if (isDigit(key) && length > 0 && valWithoutSpaces.charAt(length - 1) === 'e') {
            save = false
            popupMessage(langPack["sign-after-e-text"], 2000)
        } else if ((valWithoutSpaces === '0' || valWithoutSpaces === '-0') && key !== '.') {
            save = false
        } else if (valWithoutSpaces.includes('e') || key === 'e') {
            // scientific notation
            console.log("Check scientific number")
            if (length >= 24) {
                popupMessage(langPack["number-scientific-notation-restriction-text"])
                save = false
            }
            let number = Math.abs(parseFloat(valWithoutSpaces))
            console.log(`value without key added = ${number}`)
            if (number > Number.MAX_VALUE ||
                number < Number.MIN_VALUE ||
                number === 0 || number === -0) {
                save = false
                removeWarning = false
            }
            number = parseFloat(valWithoutSpaces + key)
            let a = Math.abs(number)
            console.log(`value with key = ${number}`)
            if (length !== 24) {
                if (a > Number.MAX_VALUE ||
                    a < Number.MIN_VALUE ||
                    a === 0) {
                    if ((valWithoutSpaces + key).includes('e')) {
                        event.target.classList.add("warning")
                        removeWarning = false
                    }
                    popupMessage(langPack["number-out-of-bound-text"].replace("${}", `${number}`))
                }
            } else {
                save = false
            }
        } else if (length > 14) {
            if (valWithoutSpaces.includes('.') || key === '.') {
                // float
                if (length >= 20) {
                    popupMessage(langPack["number-input-length-restriction-text"])
                    save = false
                }
            } else
                checkIntegerInput()

        }
        if (save) {
            console.log("Input is correct number")
            if (parseInt(event.target.cols, 10) + 2 === val.length)
                event.target.cols = parseInt(event.target.cols, 10) + 1
            event.target.value += key
            if (isNaN(parseFloat(event.target.value)))
                event.target.classList.add("warning")
            else if(removeWarning){
                hidePopup()
                if (event.target.classList.contains("warning")) {
                    event.target.classList.remove("warning")
                }
            }
        }
    } else if (key === "Backspace") {
        event.target.value = val ? val.substring(0, val.length - 1) : ""
        key = ''
        if (parseInt(event.target.cols, 10) > 2)
            event.target.cols = parseInt(event.target.cols, 10) - 1
        valWithoutSpaces = event.target.value.replaceAll(" ", "")
        length = valWithoutSpaces.length
        if (valWithoutSpaces.length > 14 &&
            isDigit(valWithoutSpaces.charAt(0) === '-' ?
                valWithoutSpaces.substring(1) : valWithoutSpaces)) {
            console.log("Checking for overflow")
            checkIntegerInput()
        }
        if (removeWarning) {
            hidePopup()
            if (event.target.classList.contains("warning")) {
                event.target.classList.remove("warning")
            }
        }
        if (isNaN(parseFloat(event.target.value)) || length < 2)
            if (!event.target.classList.contains("warning"))
                event.target.classList.add("warning")
    } else if (key === "Enter") {
        hidePopup()
        event.target.blur()
    } else if (["ArrowLeft", "Home"].includes(key)) {
        popupMessage(langPack["cursor-moving-is-forbidden-text"], 2000)
    } else {
        popupMessage(langPack["enter-correct-number-text"], 1500)
        console.log(`Incorrect symbol in number input: ${key}`)
    }
}