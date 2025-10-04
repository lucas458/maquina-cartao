Math.clamp = (value, min, max) => {
    if (value < min) return min;
    if (value > max) return max;
    return value;
};

var RESET_BLOQUEADO   = true;
var TECLADO_BLOQUEADO = true;
var CARTAO_BLOQUEADO  = true;
var JOGADORES         = [15e3, 15e3, 15e3, 15e3, 15e3, 15e3];
const temp_storage    = localStorage.getItem('JOGADORES');

if ( temp_storage == null ){
    localStorage.setItem('JOGADORES', '[15e3, 15e3, 15e3, 15e3, 15e3, 15e3]');
}else{
    JOGADORES = JSON.parse(temp_storage);
}


function setSegmentoMais( state ){
    maquina_lcd_segmento_add.classList.toggle('segmento_ativo', state);
}
function setSegmentoMenos( state ){
    maquina_lcd_segmento_remove.classList.toggle('segmento_ativo', state);
}
function setSegmentoK( state ){
    maquina_lcd_segmento_K.classList.toggle('segmento_ativo', state);
}
function setSegmentoM( state ){
    maquina_lcd_segmento_M.classList.toggle('segmento_ativo', state);
}

function setDigitosContent( valor ){
    if ( valor == undefined ){
        maquina_lcd_digitos.innerHTML = '';
        return;
    }
    maquina_lcd_digitos.innerHTML = Math.clamp(valor, -999999, 999999);
}

function limparLCD(){
    document.querySelectorAll('.segmento_ativo').forEach(e => e.classList.remove('segmento_ativo'));
    setDigitosContent();
}

function selfTestLCD(){
    setSegmentoK(true);
    setSegmentoM(true);
    setSegmentoMais(true);
    setSegmentoMenos(true);
    setDigitosContent('-888888');
}


function transferirDinheiro(valor, jogadorRX_index, jogadorTX_index){

    // TRANSFERIR
    if ( jogadorTX_index >= 0 && jogadorRX_index >= 0 ){
        TECLADO_BLOQUEADO = CARTAO_BLOQUEADO = true;
        RESET_BLOQUEADO = true;
        JOGADORES[jogadorTX_index] -= valor;
        JOGADORES[jogadorRX_index] += valor;
        salvarDados();

        // TRANSFERIR : RECEBER +
        for (let i = 0; i <= valor; i++){

            setTimeout(()=>{
                const v = JOGADORES[jogadorRX_index] - valor + i;
                setDigitosContent(v.toLocaleString());

                if ( i >= valor ){
                    
                    // TRANSFERIR : RETIRAR -
                    setTimeout(()=>{
                        for (let j = 0; j <= valor; j++){
                            setTimeout(()=>{
                                const v = JOGADORES[jogadorTX_index] + valor - j;
                                setDigitosContent(v.toLocaleString()); 
                                if (j >= valor){
                                    onTransicaoEnd(); 
                                }
                            }, 1 * j);
                        }
                    }, 1500);

                }

            }, 1 * i);
        }

        return;
    }


    // RETIRAR -
    if ( jogadorTX_index >= 0 ){
        TECLADO_BLOQUEADO = CARTAO_BLOQUEADO = true;
        RESET_BLOQUEADO = true;
        JOGADORES[jogadorTX_index] -= valor;
        salvarDados();

        for (let i = 0; i <= valor; i++){
            setTimeout(()=>{
                const v = JOGADORES[jogadorTX_index] + valor - i;
                setDigitosContent(v.toLocaleString()); 
                if (i >= valor){
                    onTransicaoEnd();
                }
            }, 1 * i);
        }

        return;
    }


    // RECEBER +
    if ( jogadorRX_index >= 0 ){
        TECLADO_BLOQUEADO = CARTAO_BLOQUEADO = true;
        RESET_BLOQUEADO = true;
        JOGADORES[jogadorRX_index] += valor;
        salvarDados();

        for (let i = 0; i <= valor; i++){
            setTimeout(()=>{
                const v = JOGADORES[jogadorRX_index] - valor + i;
                setDigitosContent(v.toLocaleString()); 
                if (i >= valor){
                    onTransicaoEnd();
                }
            }, 1 * i);
        }

    }

}


function getCartaoMaisConectado(){
    return cartao_container_mais.firstElementChild;
}

function getCartaoMenosConectado(){
    return cartao_container_menos.firstElementChild;
}

function hasCartaoConectado(){
    return getCartaoMaisConectado() != null || getCartaoMenosConectado() != null;
}

function hasDoisCartoesConectados(){
    return getCartaoMaisConectado() != null && getCartaoMenosConectado() != null;
}

function getStringCartoesConectado(){
    if ( !hasCartaoConectado() ) return '';

    let str = '';
    const cartaoMais = getCartaoMaisConectado();
    const cartaoMenos = getCartaoMenosConectado();
    str += (cartaoMais != null)? cartaoMais.getAttribute('card-index') : '-';
    str += '----';
    str += (cartaoMenos != null)? cartaoMenos.getAttribute('card-index') : '-';
    return str;
}

// CALLBACK: CARTAO CONECTADO
function onCartaoConectado( cartao ){
    console.warn('conectado', cartao);
    const cartaoTipoMais = cartao.parentElement.id == "cartao_container_mais";
    setSegmentoMais( cartaoTipoMais );
    setSegmentoMenos( !cartaoTipoMais );
    TECLADO_BLOQUEADO = CARTAO_BLOQUEADO = true;
    setDigitosContent( getStringCartoesConectado() );

    setTimeout(()=>{

        const jogador_index = cartao.getAttribute('card-index') - 1;
        setDigitosContent( JOGADORES[jogador_index].toLocaleString() );

        setTimeout(()=>{
            setDigitosContent();
            TECLADO_BLOQUEADO = CARTAO_BLOQUEADO = false;
        }, 1500);

    }, 1000);

}

// CALLBACK: CARTAO DESCONECTADO
function onCartaoDesconectado( cartao ){
    console.warn('desconectado', cartao);
    const cartaoTipoMais = cartao.parentElement.id == "cartao_container_mais";
    setSegmentoMais(false);
    setSegmentoMenos(false);

    if ( cartaoTipoMais ){
        setSegmentoMenos( getCartaoMenosConectado() != null );
    }else{
        setSegmentoMais( getCartaoMaisConectado() != null );
    }

    setDigitosContent();

}

// CALLBACK: TRANSAÇÃO ENCERRADA
function onTransicaoEnd(){
    setSegmentoM(false);
    setSegmentoK(false);

    setTimeout(()=>{
        setDigitosContent();
        TECLADO_BLOQUEADO = CARTAO_BLOQUEADO = false;
        RESET_BLOQUEADO = false;
    }, 1500);

}

function executarTransicaoValida( valor ){
    const jogadorRX = getCartaoMaisConectado();
    const jogadorTX = getCartaoMenosConectado();
    const jogadorRX_index = jogadorRX != null ? jogadorRX.getAttribute('card-index') - 1 : -1;
    const jogadorTX_index = jogadorTX != null ? jogadorTX.getAttribute('card-index') - 1 : -1;
    transferirDinheiro(valor, jogadorRX_index, jogadorTX_index);
}

function mostrarErro(){
    TECLADO_BLOQUEADO = CARTAO_BLOQUEADO = true;
    RESET_BLOQUEADO = true;
    setDigitosContent('ERR.  ');
    
    setTimeout(()=>{
        setDigitosContent();
        TECLADO_BLOQUEADO = CARTAO_BLOQUEADO = false;
    }, 1500);

}

function resetar(){
    if ( RESET_BLOQUEADO ) return;
    localStorage.setItem('JOGADORES', '[15e3, 15e3, 15e3, 15e3, 15e3, 15e3 ]');
    TECLADO_BLOQUEADO = CARTAO_BLOQUEADO = true;
    selfTestLCD();

    for (let i = 0; i < JOGADORES.length; i++) {
        JOGADORES[i] = 15e3;
    }

    setTimeout(() => {
        limparLCD();
        CARTAO_BLOQUEADO = false;
        TECLADO_BLOQUEADO = !hasCartaoConectado();
    }, 1500);

}

function salvarDados(){
    localStorage.setItem('JOGADORES', JSON.stringify(JOGADORES));
}
    



// TECLADO
document.querySelectorAll('.tecla').forEach(tecla => {

    tecla.onclick = () => {

        if ( TECLADO_BLOQUEADO ) return;

        const teclaValorNumerico = parseInt(tecla.innerHTML);

        // outros
        if ( isNaN(teclaValorNumerico) ){
            console.log( tecla.innerHTML );

            if ( tecla.innerHTML == 'C' ){
                maquina_lcd_digitos.innerHTML = '';
            }


            else if ( tecla.innerHTML == '.' ){
                if ( maquina_lcd_digitos.innerHTML.indexOf('.') < 0 && maquina_lcd_digitos.innerHTML.length < 3 ){
                    if ( maquina_lcd_digitos.innerHTML == '' ){
                        maquina_lcd_digitos.innerHTML += '0';
                    }
                    maquina_lcd_digitos.innerHTML += '.';
                }

            }


            else if ( tecla.innerHTML == 'M' ){
                const value = maquina_lcd_digitos.innerHTML * 1000;
                setSegmentoM(false);
                setSegmentoK(false);
                
                if ( value <= 20e3 && maquina_lcd_digitos.innerHTML.replaceAll('.', '') != '0' && maquina_lcd_digitos.innerHTML.length > 0 ){
                    console.log('pass M');
                    setSegmentoM(true);
                    setTimeout(()=>{
                        executarTransicaoValida(parseInt(value));
                    }, 1500);
                }else{
                    console.log('fail M');
                    mostrarErro();
                }

            }


            else if ( tecla.innerHTML == 'K' ){
                setSegmentoM(false);
                setSegmentoK(false);

                if ( maquina_lcd_digitos.innerHTML.indexOf('.') < 0 && maquina_lcd_digitos.innerHTML != '0' && maquina_lcd_digitos.innerHTML.length > 0 ){
                    console.log('pass K');
                    setSegmentoK(true);
                    setTimeout(()=>{
                        executarTransicaoValida(parseInt(maquina_lcd_digitos.innerHTML));
                    }, 1500);
                }else{
                    console.log('fail K');
                    mostrarErro();
                }

            }


            else{
                console.log('seta');
                const jogadorRX = getCartaoMaisConectado();

                if ( jogadorRX != null && getCartaoMenosConectado() == null ){
                    transferirDinheiro(2000, jogadorRX.getAttribute('card-index') - 1, -1);
                }else{
                    mostrarErro();
                }

            }

        }

        // numerico
        else{
            console.log( teclaValorNumerico );

            if ( maquina_lcd_digitos.innerHTML.replaceAll('.', '').length < 3 || (maquina_lcd_digitos.innerHTML[0] == '0' && maquina_lcd_digitos.innerHTML.replaceAll('.', '').length < 4) ){

                if ( maquina_lcd_digitos.innerHTML[0] == '0' && maquina_lcd_digitos.innerHTML.length == 1 ){
                    maquina_lcd_digitos.innerHTML = '';
                }

                maquina_lcd_digitos.innerHTML += tecla.innerHTML.toString();
            }

        }
        

    };  

});




// CONECTAR CARTAO
document.querySelectorAll('.cartao_lista_item').forEach((cartao_lista_item, index) => {

    cartao_lista_item.onmousedown = (event) => { 

        if ( CARTAO_BLOQUEADO ) return;
        
        if ( (event.button == 0 && cartao_container_mais.firstElementChild == null) || (event.button == 2 && cartao_container_menos.firstElementChild == null) ){
            
            if ( !cartao_lista_item.classList.contains('cartao_lista_item_usado') ){

                cartao_lista_item.classList.add('cartao_lista_item_usado');

                if ( event.button == 0 ){
                    cartao_container_mais.innerHTML = `<div class="cartao" card-index="${index+1}"></div>`;
                    onCartaoConectado( getCartaoMaisConectado() );
                }else{
                    cartao_container_menos.innerHTML = `<div class="cartao" card-index="${index+1}"></div>`;
                    onCartaoConectado( getCartaoMenosConectado() );
                }

            }

        }
    };

});



// DESCONECTAR CARTAO
document.querySelectorAll('.cartao_container').forEach((cartao_container, cartao_container_index) => {
    cartao_container.onclick = () => {

        if ( CARTAO_BLOQUEADO ) return;

        if ( cartao_container.firstElementChild ){
            const index = parseInt(cartao_container.firstElementChild.getAttribute('card-index'));
            document.querySelectorAll('.cartao_lista_item')[index - 1].classList.remove('cartao_lista_item_usado');

            if ( cartao_container_index == 0 ){
                onCartaoDesconectado( getCartaoMaisConectado() );
            }else{
                onCartaoDesconectado( getCartaoMenosConectado() );
            }

            cartao_container.firstElementChild.remove();
            TECLADO_BLOQUEADO = !hasCartaoConectado();

        }
    };
});


onload = () => {
    selfTestLCD();

    setTimeout(()=>{
        limparLCD();
        CARTAO_BLOQUEADO = false;
        RESET_BLOQUEADO = false;
    }, 1500);

};