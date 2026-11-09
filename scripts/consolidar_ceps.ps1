<#
.SYNOPSIS
    Script de extração e consolidação da base de CEPs de Leopoldina - MG via ViaCEP.
.DESCRIPTION
    Atende aos requisitos da Seção 2 da Atividade Prática:
    - Consulta tipos de logradouros obrigatórios: Rua, Avenida e Praça
    - Unifica os registros em 'data/ceps.json'
    - Higieniza e remove registros duplicados
#>

$cidade = "Leopoldina"
$tipos = @("Rua", "Avenida", "Praca")
$todosRegistros = @()

Write-Host "Iniciando extração para a cidade de $cidade..." -ForegroundColor Cyan

foreach ($tipo in $tipos) {
    $url = "https://viacep.com.br/ws/MG/$cidade/$tipo/json/"
    Write-Host "Requisitando: $url" -ForegroundColor Gray
    try {
        $resultado = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 15
        if ($resultado) {
            Write-Host " -> $($resultado.Count) logradouros obtidos ($tipo)" -ForegroundColor Green
            $todosRegistros += $resultado
        }
    } catch {
        Write-Warning "Falha ao obter $tipo : $_"
    }
}

Write-Host "`nTotal bruto de registros: $($todosRegistros.Count)" -ForegroundColor Yellow

# Higienização: remover duplicatas com base no CEP
$registrosUnicos = $todosRegistros | Sort-Object -Property cep -Unique
Write-Host "Total de registros únicos e higienizados: $($registrosUnicos.Count)" -ForegroundColor Green

# Garantir pasta data/
$dataDir = Join-Path $PSScriptRoot "..\data"
if (-not (Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir | Out-Null
}

$caminhoFinal = Join-Path $dataDir "ceps.json"
$caminhoJs = Join-Path $dataDir "ceps-data.js"
$jsonFormatado = $registrosUnicos | ConvertTo-Json -Depth 5
[System.IO.File]::WriteAllText($caminhoFinal, $jsonFormatado, [System.Text.Encoding]::UTF8)

# Cria versão script para contingência em execução via duplo clique (protocolo file://)
$jsContent = "window.CEPS_DATA = " + $jsonFormatado + ";"
[System.IO.File]::WriteAllText($caminhoJs, $jsContent, [System.Text.Encoding]::UTF8)

Write-Host "`nArquivos gravados com sucesso em:" -ForegroundColor Cyan
Write-Host " -> $caminhoFinal" -ForegroundColor Green
Write-Host " -> $caminhoJs" -ForegroundColor Green

