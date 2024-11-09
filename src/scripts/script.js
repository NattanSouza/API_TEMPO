async function carregarEstados() {
    try {
        const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
        const estados = await response.json();
        const selectEstado = document.getElementById('estado'); 
        estados.forEach(estado => {
            const option = document.createElement('option');  
            option.value = estado.id;
            option.textContent = estado.nome;  
            selectEstado.appendChild(option);  
        });
    } catch (error) {
        console.error('Erro ao carregar estados:', error);
    }
}

async function carregarCidades(estadoId) {
    try {
        const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoId}/municipios`);
        const cidades = await response.json();
        const selectCidade = document.getElementById('cidade');
        selectCidade.innerHTML = '<option value="">Selecione uma cidade</option>'; 
        cidades.forEach(cidade => {
            const option = document.createElement('option');  
            option.value = cidade.nome; 
            option.textContent = cidade.nome;  
            selectCidade.appendChild(option);  
        });
    } catch (error) {
        console.error('Erro ao carregar cidades:', error);
    }
}

function atualizarDataAtual() {
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    document.getElementById('dataAtual').textContent = `Data Atual: ${dataAtual}`;
}

async function buscarDados() {
    const apiKey = "e55a0c51bc3f493ea98215357240811";
    const cidade = document.getElementById('cidade').value;

    if (cidade) {
        try {
            const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${cidade}&days=1&aqi=yes&alerts=yes&lang=pt`);
            const data = await response.json();
            console.log('Dados recebidos:', data);

            // Serve para exibir a qualidade do ar
            if (data.current && data.current.air_quality) {
                const airQuality = data.current.air_quality;
                const qualidadeArContainer = document.getElementById('qualidadeAr');
                qualidadeArContainer.innerHTML = `
                    <h1>Qualidade do Ar</h1>
                    <p><b>Índice:</b> ${airQuality['gb-defra-index']}</p>
                    <p>
                        <b>CO:</b> ${airQuality.co}, <b>NO2:</b> ${airQuality.no2}, <b>O3:</b> ${airQuality.o3},
                        <b>PM2.5:</b> ${airQuality.pm2_5}, <br> <br>
                         <b>PM10:</b> ${airQuality.pm10}, <b>SO2:</b> ${airQuality.so2}
                    </p>
                `;

                //Serve para estilizar a condicao da qualidade do ar conforme o indice
                const indice = airQuality['gb-defra-index']; 
                const mensagemQualidade = document.getElementById('mensagemQualidade');
                mensagemQualidade.style.display = 'block'; 

                if (indice >= 1 && indice <= 3) {
                    mensagemQualidade.textContent = 'BOA';
                    mensagemQualidade.style.backgroundColor = 'green';
                    mensagemQualidade.style.color = 'white';
                } else if (indice >= 4 && indice <= 6) {
                    mensagemQualidade.textContent = 'MÉDIA';
                    mensagemQualidade.style.backgroundColor = 'yellow';
                    mensagemQualidade.style.color = 'black';
                } else if (indice >= 7 && indice <= 9) {
                    mensagemQualidade.textContent = 'ALTA';
                    mensagemQualidade.style.backgroundColor = 'red';
                    mensagemQualidade.style.color = 'white';
                } else if (indice > 10) {
                    mensagemQualidade.textContent = 'MUITO ALTA';
                    mensagemQualidade.style.backgroundColor = 'purple';
                    mensagemQualidade.style.color = 'white';
                } else {
                    mensagemQualidade.style.display = 'none'; // Esconde a mensagem se o índice não se encaixar
                }

            } else {
                document.getElementById('qualidadeAr').innerHTML = `
                    <h3>Qualidade do Ar em ${cidade}</h3>
                    <p>Dados não disponíveis</p>
                `;
            }

            // Atualiza a tabela dos crias
            const tbody = document.getElementById('previsao').querySelector('tbody');
            tbody.innerHTML = ''; 

            data.forecast.forecastday[0].hour.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.time.split(' ')[1]}</td>
                    <td>${item.condition.text}</td>
                    <td>${item.chance_of_rain !== undefined ? item.chance_of_rain : 'N/A'}</td>
                    <td>${item.temp_c}</td>
                    <td>${item.feelslike_c}</td>
                    <td>${item.humidity}</td>
                    <td>${item.wind_kph}</td>
                `;
                tbody.appendChild(row);
            });

            gerarRelatorio();
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        }
    }
}

function gerarRelatorio() {
    const localPrevisao = document.getElementById('info');
    const estado = document.getElementById('estado').options[document.getElementById('estado').selectedIndex].text;
    const cidade = document.getElementById('cidade').value;
    
    localPrevisao.textContent = `Relatório de Previsão do Tempo para ${cidade}, ${estado}`;
}

async function salvarPDF() {
    const elemento = document.getElementById('relatorio');
    var options = {
        margin:       [5, 5, 5, 5],
        filename:     'relatorio do tempo.pdf',
        image:        { type: 'png', quality: 2 },
        html2canvas:  { scale: 1 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };
    html2pdf().set(options).from(elemento).save();
}

// Event Listeners para monitoraer as acoes 
document.getElementById('estado').addEventListener('change', function() {
    carregarCidades(this.value);
});

document.getElementById('cidade').addEventListener('change', buscarDados);

// Inicializations 
document.addEventListener('DOMContentLoaded', () => {
    carregarEstados();
    atualizarDataAtual();
});