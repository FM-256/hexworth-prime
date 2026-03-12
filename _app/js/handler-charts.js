/**
 * Handler Dashboard Chart Renderers
 * Lightweight SVG/Canvas chart components — no external library dependencies.
 */
const HandlerCharts = (function() {
    'use strict';

    function donut(container, data, options) {
        // data: [{ label, value, color }]
        // Renders SVG donut chart
        const size = options.size || 120;
        const thickness = options.thickness || 20;
        const total = data.reduce((s, d) => s + d.value, 0);
        if (!total) { container.innerHTML = '<span style="color:var(--hd-text-muted,#888);font-size:0.7rem">No data</span>'; return; }

        const r = (size - thickness) / 2;
        const cx = size / 2;
        const cy = size / 2;
        const circumference = 2 * Math.PI * r;

        let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
        let offset = 0;

        data.forEach(d => {
            const pct = d.value / total;
            const dash = pct * circumference;
            const gap = circumference - dash;
            svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${d.color}" stroke-width="${thickness}" stroke-dasharray="${dash} ${gap}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})" />`;
            offset += dash;
        });

        svg += '</svg>';
        container.innerHTML = svg;
    }

    function barChart(container, data, options) {
        // data: [{ label, value, color }]
        const maxVal = Math.max(...data.map(d => d.value), 1);
        const barWidth = options.barWidth || 'auto';
        const height = options.height || 100;

        let html = '<div style="display:flex;align-items:flex-end;gap:4px;height:' + height + 'px">';
        data.forEach(d => {
            const h = Math.round((d.value / maxVal) * height);
            const w = barWidth === 'auto' ? 'flex:1' : 'width:' + barWidth + 'px';
            html += `<div style="${w};display:flex;flex-direction:column;align-items:center;gap:2px">`;
            html += `<div style="height:${h}px;width:100%;background:${d.color || 'var(--hd-accent,#d4a017)'};border-radius:2px 2px 0 0;min-height:2px"></div>`;
            html += `<span style="font-size:0.55rem;color:var(--hd-text-muted,#888);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%">${d.label}</span>`;
            html += '</div>';
        });
        html += '</div>';
        container.innerHTML = html;
    }

    function sparkline(container, values, options) {
        // values: number[]
        const width = options.width || 120;
        const height = options.height || 40;
        const color = options.color || 'var(--hd-accent,#d4a017)';

        if (!values.length) { container.innerHTML = ''; return; }

        const min = Math.min(...values);
        const max = Math.max(...values) || 1;
        const range = max - min || 1;

        const points = values.map((v, i) => {
            const x = (i / (values.length - 1 || 1)) * width;
            const y = height - ((v - min) / range) * (height - 4) - 2;
            return `${x},${y}`;
        }).join(' ');

        container.innerHTML = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>`;
    }

    function histogram(container, buckets, options) {
        // buckets: [{ label, count, color }]
        barChart(container, buckets.map(b => ({ label: b.label, value: b.count, color: b.color })), options);
    }

    return { donut, barChart, sparkline, histogram };
})();
