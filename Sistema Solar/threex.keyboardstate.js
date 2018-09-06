// JHONATAS I. C. L.
// THREEx.KeyboardState.js mantém o estado atual do teclado.
// É possível consultá-lo a qualquer momento. Não há necessidade de um evento.
// Isso é particularmente conveniente no caso de loop, como em
// demos ou jogos em 3D.
//
// # Usage
//
// ** Etapa 1 **: crie o objeto
//
// `` `var keyboard = new THREEx.KeyboardState ();` ``
//
// ** Etapa 2 **: consulte o estado do teclado
//
// Isso retornará verdadeiro se shift e A forem pressionados, false caso contrário
//
// `` `keyboard.press (" shift + A ")` ``
//
// ** Passo 3 **: Pare de ouvir o teclado
//
// `` `keyboard.destroy ()` ``
//
// NOTA: esta biblioteca pode ser legal como standaline. independente de three.js
// - renomeie para keyboardForGame
//
// # Code
//

/ ** @namespace * /
var THREEx = THREEx || {};

/ **
 * - NOTA: seria muito fácil empurrar eventos também
 * - microevent.js para manipulação de eventos
 * - neste._onkeyChange, gere uma string do evento DOM
 * - use isso como nome do evento
* /
THREEx.KeyboardState = function (domElement)
{
	this.domElement = domElement || documento;
	// para armazenar o estado atual
	this.keyCodes = {};
	this.modifiers = {};
	
	// cria callback para ligar / desligar eventos de teclado
	var _this = this;
	this._onKeyDown = function (event) {_this._onKeyChange (event)}
	this._onKeyUp = function (event) {_this._onKeyChange (event)}

	// bind keyEvents
	this.domElement.addEventListener ("keydown", this._onKeyDown, false);
	this.domElement.addEventListener ("keyup", this._onKeyUp, false);
}

/ **
 * Para parar de ouvir os eventos do teclado
* /
THREEx.KeyboardState.prototype.destroy = function ()
{
	// desvincular keyEvents
	this.domElement.removeEventListener ("keydown", this._onKeyDown, false);
	this.domElement.removeEventListener ("keyup", this._onKeyUp, false);
}

THREEx.KeyboardState.MODIFIERS = ['shift', 'ctrl', 'alt', 'meta'];
THREEx.KeyboardState.ALIAS = {
	'esquerda': 37,
	'up': 38,
	'right': 39,
	'down': 40,
	'espaço': 32,
	'pageup': 33,
	'pagedown': 34,
	'tab': 9,
	'escape': 27
};

/ **
 * para processar o evento dom do teclado
* /
THREEx.KeyboardState.prototype._onKeyChange = function (event)
{
	// log para depurar
	//console.log("onKeyChange ", event, event.keyCode, event.shiftKey, event.ctrlKey, event.altKey, event.metaKey)

	// update this.keyCodes
	var keyCode = event.keyCode
	var pressed = event.type === 'keydown'? verdadeiro falso
	this.keyCodes [keyCode] = pressionado
	// update this.modifiers
	this.modifiers ['shift'] = event.shiftKey
	this.modifiers ['ctrl'] = event.ctrlKey
	this.modifiers ['alt'] = event.altKey
	this.modifiers ['meta'] = event.metaKey
}

/ **
 * consulta estado do teclado para saber se uma tecla é pressionada de não
 *
 * @param {String} keyDesc a descrição da chave. formato: modificadores + chave, por exemplo, shift + A
 * @returns {Boolean} true se a tecla for pressionada, false caso contrário
* /
THREEx.KeyboardState.prototype.pressed = function (keyDesc) {
	var keys = keyDesc.split ("+");
	para (var i = 0; i <keys.length; i ++) {
		var key = keys [i]
		var pressionado = falso
		if (THREEx.KeyboardState.MODIFIERS.indexOf (chave)! == -1) {
			pressionado = this.modifiers [chave];
		} else if (Object.keys (THREEx.KeyboardState.ALIAS) .indexOf (chave)! = -1) {
			pressionado = this.keyCodes [THREEx.KeyboardState.ALIAS [chave]];
		}outro {
			pressionado = this.keyCodes [key.toUpperCase (). charCodeAt (0)]
		}
		if (! pressionado) retorna falso;
	};
	retorno verdadeiro;
}

/ **
 * return true se um evento corresponder a um keyDesc
 Evento de teclado do evento @param {KeyboardEvent}
 * @param {String} keyDesc descrição da chave da chave
 * @return {Boolean} true se o evento corresponder a keyDesc, false caso contrário
 * /
THREEx.KeyboardState.prototype.eventMatches = function (event, keyDesc) {
	var aliases = THREEx.KeyboardState.ALIAS
	var aliasKeys = Object.keys (aliases)
	var keys = keyDesc.split ("+")
	// log para depurar
	// console.log ("eventMatches", evento, event.keyCode, event.shiftKey, event.ctrlKey, event.altKey, event.metaKey)
	para (var i = 0; i <keys.length; i ++) {
		var key = chaves [i];
		var pressionado = falso;
		if (chave === 'shift') {
			pressionado = (event.shiftKey? true: false)
		} else if (key === 'ctrl') {
			pressionado = (event.ctrlKey? true: false)
		} else if (chave === 'alt') {
			pressionado = (event.altKey? true: false)
		} else if (key === 'meta') {
			pressionado = (event.metaKey? true: false)
		} else if (aliasKeys.indexOf (chave)! == -1) {
			pressionado = (event.keyCode === aliases [chave]? verdadeiro: falso);
		} else if (event.keyCode === key.toUpperCase (). charCodeAt (0)) {
			pressionado = verdadeiro;
		}
		if (! pressionado) retorna falso;
	}
	retorno verdadeiro;
}

