export interface TelecomMetrics {
  // Signal Quality Metrics
  rsrp: number        // Reference Signal Received Power (dBm)
  rsrq: number        // Reference Signal Received Quality (dB)
  rssi: number        // Received Signal Strength Indicator (dBm)
  sinr: number        // Signal-to-Interference-plus-Noise Ratio (dB)
  snr: number         // Signal-to-Noise Ratio (dB)
  
  // Channel Capacity Metrics
  shannonCapacity: number     // Shannon capacity (Mbps)
  spectralEfficiency: number  // bits/s/Hz
  throughput: number          // Estimated throughput (Mbps)
  
  // Path Loss & Propagation
  pathLoss: number           // Free-space path loss (dB)
  fadingMargin: number       // Rayleigh fading margin (dB)
  linkBudget: number         // Link budget (dB)
  
  // QoS Indicators
  ber: number                // Bit Error Rate (approximate)
  per: number                // Packet Error Rate (approximate)
  latency: number            // Estimated latency (ms)
  jitter: number             // Estimated jitter (ms)
  mos: number                // Mean Opinion Score (1-5)
  
  // Modulation & Coding
  cqi: number                // Channel Quality Indicator (0-15)
  mcs: number                // Modulation and Coding Scheme
  modulationType: string     // Current modulation type
  codeRate: number           // Code rate
  
  // Power & Interference
  interferenceLevel: number  // Interference level (dBm)
  noiseFigure: number        // Noise figure (dB)
  thermalNoise: number       // Thermal noise power (dBm)
  
  // Signal Status
  signalStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  signalBars: number         // 0-5 bars
  
  // Predictions
  distanceToLoss: number     // km until signal loss
  timeToLoss: number         // minutes until signal loss (at 60 km/h)
}

interface CalculationParams {
  rssi: number
  sinr: number
  bandwidth: number
  frequency: number
  modulationIndex: number
  pathLossExponent: number
  distance: number
}

const MODULATION_TYPES = [
  { name: 'BPSK', bitsPerSymbol: 1, minSinr: -5 },
  { name: 'QPSK', bitsPerSymbol: 2, minSinr: 0 },
  { name: '16-QAM', bitsPerSymbol: 4, minSinr: 6 },
  { name: '64-QAM', bitsPerSymbol: 6, minSinr: 12 },
  { name: '256-QAM', bitsPerSymbol: 8, minSinr: 18 },
  { name: '1024-QAM', bitsPerSymbol: 10, minSinr: 24 },
]

export function calculateTelecomMetrics(params: CalculationParams): TelecomMetrics {
  const { rssi, sinr, bandwidth, frequency, modulationIndex, pathLossExponent, distance } = params
  
  // Thermal noise calculation: N = kTB (in dBm)
  const boltzmann = 1.38e-23
  const temperature = 290 // Kelvin
  const bandwidthHz = bandwidth * 1e6
  const thermalNoise = 10 * Math.log10(boltzmann * temperature * bandwidthHz * 1000)
  
  // Noise figure (typical value for mobile devices)
  const noiseFigure = 7 // dB
  
  // Total noise power
  const totalNoise = thermalNoise + noiseFigure
  
  // SNR calculation
  const snr = rssi - totalNoise
  
  // RSRP (approximation based on RSSI and number of RBs)
  const numResourceBlocks = Math.floor(bandwidth / 0.18) // 180 kHz per RB
  const rsrp = rssi - 10 * Math.log10(12 * numResourceBlocks)
  
  // RSRQ calculation: RSRQ = N × RSRP / RSSI (in dB)
  const rsrq = 10 * Math.log10(numResourceBlocks) + rsrp - rssi
  
  // Path Loss (Free-Space Path Loss with adjustments)
  // FSPL = 20*log10(d) + 20*log10(f) + 20*log10(4π/c)
  const pathLoss = distance > 0 
    ? 32.45 + 20 * Math.log10(frequency) + 10 * pathLossExponent * Math.log10(distance + 0.1)
    : 32.45 + 20 * Math.log10(frequency)
  
  // Fading margin (Rayleigh fading approximation)
  const fadingMargin = 10 * Math.log10(1 + Math.pow(10, -sinr / 10))
  
  // Link budget
  const txPower = 23 // dBm (typical LTE eNodeB)
  const antennaGain = 15 // dBi
  const linkBudget = txPower + antennaGain - pathLoss - fadingMargin
  
  // Determine modulation based on SINR
  let selectedModulation = MODULATION_TYPES[0]
  for (let i = MODULATION_TYPES.length - 1; i >= 0; i--) {
    if (sinr >= MODULATION_TYPES[i].minSinr) {
      selectedModulation = MODULATION_TYPES[i]
      break
    }
  }
  
  // Shannon Capacity: C = B * log2(1 + SNR)
  const linearSinr = Math.pow(10, sinr / 10)
  const shannonCapacity = bandwidth * Math.log2(1 + linearSinr)
  
  // Spectral Efficiency
  const spectralEfficiency = Math.log2(1 + linearSinr)
  
  // Code rate (varies with CQI)
  const codeRate = Math.min(0.93, Math.max(0.08, 0.1 + sinr * 0.04))
  
  // Practical throughput (accounting for overhead, ~75% efficiency)
  const throughput = shannonCapacity * codeRate * 0.75
  
  // CQI mapping (0-15 based on SINR)
  const cqi = Math.min(15, Math.max(0, Math.floor((sinr + 10) / 2)))
  
  // MCS (0-28 for LTE)
  const mcs = Math.min(28, Math.max(0, Math.floor(cqi * 1.87)))
  
  // BER approximation (simplified AWGN model)
  const ber = sinr > 0 
    ? 0.5 * Math.exp(-1.5 * linearSinr / (Math.pow(2, selectedModulation.bitsPerSymbol) - 1))
    : 0.5
  
  // PER approximation (assumes 1500 byte packets)
  const packetBits = 1500 * 8
  const per = 1 - Math.pow(1 - ber, packetBits)
  
  // Latency estimation based on signal quality
  const baseLatency = 20 // ms
  const latency = baseLatency + Math.max(0, (100 - rssi) * 0.5) + per * 100
  
  // Jitter estimation
  const jitter = Math.max(1, latency * 0.1 * (1 + per * 5))
  
  // MOS calculation (E-model approximation)
  const rFactor = Math.max(0, Math.min(100, 93.2 - latency * 0.024 - jitter * 0.11 - per * 100))
  const mos = rFactor > 60 
    ? 1 + 0.035 * rFactor + 7e-6 * rFactor * (rFactor - 60) * (100 - rFactor)
    : 1
  
  // Interference level estimation
  const interferenceLevel = rssi - sinr - totalNoise + noiseFigure
  
  // Signal status determination
  let signalStatus: TelecomMetrics['signalStatus']
  let signalBars: number
  
  if (rssi >= -65 && sinr >= 15) {
    signalStatus = 'excellent'
    signalBars = 5
  } else if (rssi >= -75 && sinr >= 10) {
    signalStatus = 'good'
    signalBars = 4
  } else if (rssi >= -85 && sinr >= 5) {
    signalStatus = 'fair'
    signalBars = 3
  } else if (rssi >= -100 && sinr >= 0) {
    signalStatus = 'poor'
    signalBars = 2
  } else {
    signalStatus = 'critical'
    signalBars = rssi >= -110 ? 1 : 0
  }
  
  // Predict distance to signal loss (-110 dBm threshold)
  const currentPathLoss = pathLoss
  const maxAllowableLoss = txPower + antennaGain - (-110) - fadingMargin
  const remainingLossMargin = maxAllowableLoss - currentPathLoss
  const distanceToLoss = remainingLossMargin > 0 
    ? Math.pow(10, remainingLossMargin / (10 * pathLossExponent)) * (distance + 0.1) - distance
    : 0
  
  // Time to loss (assuming 60 km/h average speed)
  const timeToLoss = distanceToLoss > 0 ? (distanceToLoss / 60) * 60 : 0 // minutes
  
  return {
    rsrp: Math.round(rsrp * 10) / 10,
    rsrq: Math.round(rsrq * 10) / 10,
    rssi,
    sinr,
    snr: Math.round(snr * 10) / 10,
    shannonCapacity: Math.round(shannonCapacity * 100) / 100,
    spectralEfficiency: Math.round(spectralEfficiency * 100) / 100,
    throughput: Math.round(throughput * 100) / 100,
    pathLoss: Math.round(pathLoss * 10) / 10,
    fadingMargin: Math.round(fadingMargin * 10) / 10,
    linkBudget: Math.round(linkBudget * 10) / 10,
    ber: ber,
    per: Math.min(1, per),
    latency: Math.round(latency * 10) / 10,
    jitter: Math.round(jitter * 10) / 10,
    mos: Math.round(mos * 100) / 100,
    cqi,
    mcs,
    modulationType: selectedModulation.name,
    codeRate: Math.round(codeRate * 1000) / 1000,
    interferenceLevel: Math.round(interferenceLevel * 10) / 10,
    noiseFigure,
    thermalNoise: Math.round(thermalNoise * 10) / 10,
    signalStatus,
    signalBars,
    distanceToLoss: Math.round(distanceToLoss * 10) / 10,
    timeToLoss: Math.round(timeToLoss * 10) / 10,
  }
}

export function getStatusColor(status: TelecomMetrics['signalStatus']): string {
  switch (status) {
    case 'excellent': return 'text-emerald-400'
    case 'good': return 'text-green-400'
    case 'fair': return 'text-yellow-400'
    case 'poor': return 'text-orange-400'
    case 'critical': return 'text-red-400'
  }
}

export function getStatusBgColor(status: TelecomMetrics['signalStatus']): string {
  switch (status) {
    case 'excellent': return 'bg-emerald-500/20'
    case 'good': return 'bg-green-500/20'
    case 'fair': return 'bg-yellow-500/20'
    case 'poor': return 'bg-orange-500/20'
    case 'critical': return 'bg-red-500/20'
  }
}

export function formatScientific(value: number): string {
  if (value === 0) return '0'
  if (value >= 0.001 && value < 1000) {
    return value.toFixed(4)
  }
  return value.toExponential(2)
}
