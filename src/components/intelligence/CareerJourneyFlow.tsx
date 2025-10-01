// Career Journey Flow Visualization
// Visual representation of career path from current to target role

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { TrendingUp, Award, Clock, DollarSign } from 'lucide-react'

interface CareerNode {
  id: string
  role: string
  timeline: string
  salary_range?: { min: number; max: number }
  status: 'current' | 'next' | 'target' | 'alternative'
  probability?: number
}

interface CareerJourneyFlowProps {
  currentRole: string
  targetRole: string
  mostLikelyNext: string
  alternativePaths?: Array<{ role: string; timeline: string; difficulty: string }>
  salaryData?: any
}

export default function CareerJourneyFlow({
  currentRole,
  targetRole,
  mostLikelyNext,
  alternativePaths = [],
  salaryData
}: CareerJourneyFlowProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove()

    const width = 1000
    const height = 500
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)

    // Define nodes
    const nodes: CareerNode[] = [
      {
        id: 'current',
        role: currentRole,
        timeline: 'Now',
        status: 'current'
      },
      {
        id: 'next',
        role: mostLikelyNext,
        timeline: '12-18 months',
        salary_range: salaryData?.target_role_range ? { min: salaryData.target_role_range.min, max: salaryData.target_role_range.median } : undefined,
        status: 'next',
        probability: 75
      },
      {
        id: 'target',
        role: targetRole,
        timeline: '2-3 years',
        salary_range: salaryData?.target_role_range ? { min: salaryData.target_role_range.median, max: salaryData.target_role_range.max } : undefined,
        status: 'target',
        probability: 85
      }
    ]

    // Add alternative paths
    alternativePaths.slice(0, 2).forEach((alt, i) => {
      nodes.push({
        id: `alt-${i}`,
        role: alt.role,
        timeline: alt.timeline,
        status: 'alternative'
      })
    })

    // Define node positions
    const nodePositions: Record<string, { x: number; y: number }> = {
      'current': { x: 100, y: 250 },
      'next': { x: 400, y: 250 },
      'target': { x: 700, y: 250 },
      'alt-0': { x: 400, y: 100 },
      'alt-1': { x: 400, y: 400 }
    }

    // Draw connections
    const links = [
      { source: 'current', target: 'next', type: 'primary' },
      { source: 'next', target: 'target', type: 'primary' },
      { source: 'current', target: 'alt-0', type: 'alternative' },
      { source: 'current', target: 'alt-1', type: 'alternative' }
    ].filter(link => nodePositions[link.source] && nodePositions[link.target])

    // Draw curved links
    const linkGroup = svg.append('g').attr('class', 'links')

    links.forEach(link => {
      const source = nodePositions[link.source]
      const target = nodePositions[link.target]

      if (!source || !target) return

      const path = linkGroup.append('path')
        .attr('d', () => {
          const dx = target.x - source.x
          const dy = target.y - source.y
          const dr = Math.sqrt(dx * dx + dy * dy)
          return `M${source.x},${source.y}A${dr},${dr} 0 0,1 ${target.x},${target.y}`
        })
        .attr('fill', 'none')
        .attr('stroke', link.type === 'primary' ? '#3b82f6' : '#94a3b8')
        .attr('stroke-width', link.type === 'primary' ? 3 : 2)
        .attr('stroke-dasharray', link.type === 'alternative' ? '5,5' : '0')
        .attr('opacity', link.type === 'primary' ? 0.8 : 0.4)

      // Animate the path
      const totalLength = (path.node() as SVGPathElement).getTotalLength()
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1500)
        .ease(d3.easeQuadInOut)
        .attr('stroke-dashoffset', 0)
    })

    // Draw nodes
    const nodeGroup = svg.append('g').attr('class', 'nodes')

    nodes.forEach(node => {
      const pos = nodePositions[node.id]
      if (!pos) return

      const g = nodeGroup.append('g')
        .attr('transform', `translate(${pos.x}, ${pos.y})`)
        .attr('class', 'node-group')

      // Node background
      const rect = g.append('rect')
        .attr('x', -120)
        .attr('y', -60)
        .attr('width', 240)
        .attr('height', 120)
        .attr('rx', 12)
        .attr('fill', node.status === 'current' ? '#dbeafe' :
                      node.status === 'next' ? '#bfdbfe' :
                      node.status === 'target' ? '#93c5fd' : '#f1f5f9')
        .attr('stroke', node.status === 'current' ? '#3b82f6' :
                       node.status === 'next' ? '#2563eb' :
                       node.status === 'target' ? '#1d4ed8' : '#cbd5e1')
        .attr('stroke-width', node.status === 'alternative' ? 1 : 2)
        .attr('opacity', 0)

      // Animate node appearance
      rect.transition()
        .duration(800)
        .delay(nodes.indexOf(node) * 200)
        .attr('opacity', 1)

      // Role title
      g.append('text')
        .attr('y', -25)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#1e293b')
        .text(node.role)
        .attr('opacity', 0)
        .transition()
        .duration(800)
        .delay(nodes.indexOf(node) * 200 + 200)
        .attr('opacity', 1)

      // Timeline
      g.append('text')
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', '#64748b')
        .text(node.timeline)
        .attr('opacity', 0)
        .transition()
        .duration(800)
        .delay(nodes.indexOf(node) * 200 + 400)
        .attr('opacity', 1)

      // Salary range if available
      if (node.salary_range) {
        g.append('text')
          .attr('y', 20)
          .attr('text-anchor', 'middle')
          .attr('font-size', '11px')
          .attr('font-weight', '600')
          .attr('fill', '#059669')
          .text(`$${(node.salary_range.min / 1000).toFixed(0)}K - $${(node.salary_range.max / 1000).toFixed(0)}K`)
          .attr('opacity', 0)
          .transition()
          .duration(800)
          .delay(nodes.indexOf(node) * 200 + 600)
          .attr('opacity', 1)
      }

      // Probability badge
      if (node.probability) {
        g.append('circle')
          .attr('cx', 100)
          .attr('cy', -50)
          .attr('r', 18)
          .attr('fill', '#10b981')
          .attr('opacity', 0)
          .transition()
          .duration(800)
          .delay(nodes.indexOf(node) * 200 + 800)
          .attr('opacity', 0.9)

        g.append('text')
          .attr('x', 100)
          .attr('y', -45)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .attr('fill', 'white')
          .text(`${node.probability}%`)
          .attr('opacity', 0)
          .transition()
          .duration(800)
          .delay(nodes.indexOf(node) * 200 + 1000)
          .attr('opacity', 1)
      }

      // Status badge
      if (node.status === 'current') {
        g.append('circle')
          .attr('cx', -100)
          .attr('cy', -50)
          .attr('r', 6)
          .attr('fill', '#3b82f6')
          .attr('opacity', 0)
          .transition()
          .duration(800)
          .delay(nodes.indexOf(node) * 200 + 800)
          .attr('opacity', 1)
          .transition()
          .duration(1000)
          .attr('r', 8)
          .transition()
          .duration(1000)
          .attr('r', 6)
          .on('end', function repeat() {
            d3.select(this)
              .transition()
              .duration(1000)
              .attr('r', 8)
              .transition()
              .duration(1000)
              .attr('r', 6)
              .on('end', repeat)
          })
      }
    })

  }, [currentRole, targetRole, mostLikelyNext, alternativePaths, salaryData])

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Career Journey Map</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Your predicted career trajectory</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-600"></div>
            <span className="text-slate-600 dark:text-slate-400">Primary Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-slate-400 border-dashed border-t-2"></div>
            <span className="text-slate-600 dark:text-slate-400">Alternative</span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <div className="min-w-[1000px]">
          <svg ref={svgRef} className="w-full h-auto"></svg>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <Clock size={16} className="mx-auto mb-1 text-blue-600" />
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Timeline</p>
          <p className="font-semibold text-slate-900 dark:text-white">2-3 years</p>
        </div>

        <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <Award size={16} className="mx-auto mb-1 text-green-600" />
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Success Rate</p>
          <p className="font-semibold text-slate-900 dark:text-white">85%</p>
        </div>

        <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
          <TrendingUp size={16} className="mx-auto mb-1 text-purple-600" />
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Growth</p>
          <p className="font-semibold text-slate-900 dark:text-white">High</p>
        </div>

        <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
          <DollarSign size={16} className="mx-auto mb-1 text-orange-600" />
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Salary Gain</p>
          <p className="font-semibold text-slate-900 dark:text-white">+45%</p>
        </div>
      </div>
    </div>
  )
}
