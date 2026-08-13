const express = require('express');
const router = express.Router();

// @route   GET /api/partners
// @desc    Get active cross-border partner nodes & corridor status
router.get('/', (req, res) => {
  const partners = [
    {
      id: 'p-1',
      country: 'Poland',
      flag: '🇵🇱',
      city: 'Warsaw & Krakow',
      organization: 'UNHCR Poland & Red Cross Relief Hub',
      type: 'Humanitarian & Medical',
      status: 'Active Node',
      activeVerifiers: 42,
      protocol: 'IdentiChain SHA-256 Multi-Chain V2',
      acceptedCategories: ['Identity', 'Medical', 'Education & Property'],
      lat: 52.2297,
      lng: 21.0122,
    },
    {
      id: 'p-2',
      country: 'Germany',
      flag: '🇩🇪',
      city: 'Berlin & Munich',
      organization: 'Federal Office for Migration (BAMF Partner Portal)',
      type: 'Government & Social Welfare',
      status: 'Active Node',
      activeVerifiers: 38,
      protocol: 'IdentiChain SHA-256 Multi-Chain V2',
      acceptedCategories: ['Identity', 'Education & Property'],
      lat: 52.52,
      lng: 13.405,
    },
    {
      id: 'p-3',
      country: 'Romania',
      flag: '🇷🇴',
      city: 'Suceava & Bucharest',
      organization: 'Romanian Red Cross Emergency Medical Taskforce',
      type: 'Medical & Triage Clinic',
      status: 'Active Node',
      activeVerifiers: 24,
      protocol: 'IdentiChain SHA-256 Multi-Chain V2',
      acceptedCategories: ['Identity', 'Medical'],
      lat: 44.4323,
      lng: 26.1063,
    },
    {
      id: 'p-4',
      country: 'Czechia',
      flag: '🇨🇿',
      city: 'Prague',
      organization: 'Caritas Czech Republic & Ministry of Interior Partner Network',
      type: 'NGO & Financial Micro-Grants',
      status: 'Active Node',
      activeVerifiers: 19,
      protocol: 'IdentiChain SHA-256 Multi-Chain V2',
      acceptedCategories: ['Identity', 'Education & Property'],
      lat: 50.0755,
      lng: 14.4378,
    },
    {
      id: 'p-5',
      country: 'Moldova',
      flag: '🇲🇩',
      city: 'Chisinau & Palanca Border',
      organization: 'Moldovan Border Medical Services & UNICEF Emergency Network',
      type: 'Border & Child Welfare',
      status: 'Active Node',
      activeVerifiers: 15,
      protocol: 'IdentiChain SHA-256 Multi-Chain V2',
      acceptedCategories: ['Identity', 'Medical'],
      lat: 47.0105,
      lng: 28.8638,
    },
  ];

  res.json({
    totalNodes: 138,
    activeCorridors: 6,
    interoperabilityStandard: 'IdentiChain Zero-Trust Decentralized Identity (W3C DID Compliant)',
    partners,
  });
});

module.exports = router;
