// Interactive Skill Graph Visualization
// Node-based skill tree showing what you have vs what you need

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { Brain, CheckCircle, AlertCircle, Clock, TrendingUp } from 'lucide-react'

interface Skill {
  name: string
  status: 'have' | 'learning' | 'need'
  priority: 'critical' | 'high' | 'medium' | 'low'
  impact: number // salary impact %
  timeToLearn?: string
  connections?: string[] // skills that unlock this
}

interface SkillGraphProps {
  currentSkills: string[]
  skillsToLearn: Array<{
    skill: string
    priority: string
    learning_time: string
    impact_on_salary: number
  }>
  targetRoleSkills: string[]
}

export default function SkillGraphVisualization({
  currentSkills,
  skillsToLearn,
  targetRoleSkills
}: SkillGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove()

    const width = 1200
    const height = 700
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)

    // Combine all skills
    const allSkills: Skill[] = [
      ...currentSkills.map(skill => ({
        name: skill,
        status: 'have' as const,
        priority: 'medium' as const,
        impact: 10
      })),
      ...skillsToLearn.map(skill => ({
        name: skill.skill,
        status: 'need' as const,
        priority: skill.priority as any,
        impact: skill.impact_on_salary || 0,
        timeToLearn: skill.learning_time
      }))
    ]

    // Create force simulation
    const simulation = d3.forceSimulation(allSkills as any)
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60))

    // Create links between related skills
    const links: any[] = []
    allSkills.forEach((skill, i) => {
      if (skill.status === 'need' && i > 0) {
        // Connect to random existing skill (simulated - would be real connections)
        const targetIndex = Math.floor(Math.random() * Math.min(i, currentSkills.length))
        links.push({
          source: allSkills[targetIndex],
          target: skill
        })
      }
    })

    // Draw links
    const linkGroup = svg.append('g').attr('class', 'links')
    const link = linkGroup.selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')
      .attr('opacity', 0.3)

    // Draw nodes
    const nodeGroup = svg.append('g').attr('class', 'nodes')

    const node = nodeGroup.selectAll('g')
      .data(allSkills)
      .enter()
      .append('g')
      .attr('class', 'skill-node')
      .style('cursor', 'pointer')

    // Node circles
    node.append('circle')
      .attr('r', (d: any) => {
        if (d.priority === 'critical') return 50
        if (d.priority === 'high') return 42
        return 35
      })
      .attr('fill', (d: any) => {
        if (d.status === 'have') return '#10b981'
        if (d.priority === 'critical') return '#ef4444'
        if (d.priority === 'high') return '#f59e0b'
        return '#3b82f6'
      })
      .attr('opacity', 0.9)
      .attr('stroke', 'white')
      .attr('stroke-width', 3)

    // Inner circle for status indicator
    node.append('circle')
      .attr('r', 8)
      .attr('fill', 'white')
      .attr('cx', 25)
      .attr('cy', -25)

    // Status icon
    node.append('text')
      .attr('x', 25)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .text((d: any) => d.status === 'have' ? '✓' : '!')

    // Skill name
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 5)
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', 'white')
      .text((d: any) => {
        if (d.name.length > 12) return d.name.substring(0, 12) + '...'
        return d.name
      })

    // Impact badge
    node.filter((d: any) => d.impact > 0)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 18)
      .attr('font-size', '9px')
      .attr('fill', 'white')
      .attr('opacity', 0.9)
      .text((d: any) => `+${d.impact}% 💰`)

    // Priority badge
    node.filter((d: any) => d.priority === 'critical')
      .append('rect')
      .attr('x', -20)
      .attr('y', -40)
      .attr('width', 40)
      .attr('height', 16)
      .attr('rx', 8)
      .attr('fill', '#dc2626')

    node.filter((d: any) => d.priority === 'critical')
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -28)
      .attr('font-size', '9px')
      .attr('font-weight', 'bold')
      .attr('fill', 'white')
      .text('CRITICAL')

    // Add hover effects
    node.on('mouseover', function(event, d: any) {
      d3.select(this).select('circle').transition().duration(200).attr('r', (d: any) => {
        if (d.priority === 'critical') return 55
        if (d.priority === 'high') return 47
        return 40
      })

      // Show tooltip
      const tooltip = svg.append('g')
        .attr('class', 'tooltip')
        .attr('transform', `translate(${d.x}, ${d.y - 80})`)

      tooltip.append('rect')
        .attr('x', -100)
        .attr('y', 0)
        .attr('width', 200)
        .attr('height', d.timeToLearn ? 80 : 60)
        .attr('rx', 8)
        .attr('fill', '#1e293b')
        .attr('stroke', '#475569')
        .attr('stroke-width', 1)

      tooltip.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', 20)
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', 'white')
        .text(d.name)

      tooltip.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', 38)
        .attr('font-size', '10px')
        .attr('fill', '#94a3b8')
        .text(`Status: ${d.status}`)

      if (d.timeToLearn) {
        tooltip.append('text')
          .attr('text-anchor', 'middle')
          .attr('y', 54)
          .attr('font-size', '10px')
          .attr('fill', '#94a3b8')
          .text(`Learn in: ${d.timeToLearn}`)
      }

      tooltip.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', d.timeToLearn ? 70 : 54)
        .attr('font-size', '10px')
        .attr('fill', '#10b981')
        .text(`Impact: +${d.impact}% salary`)
    })

    node.on('mouseout', function(event, d: any) {
      d3.select(this).select('circle').transition().duration(200).attr('r', (d: any) => {
        if (d.priority === 'critical') return 50
        if (d.priority === 'high') return 42
        return 35
      })

      svg.selectAll('.tooltip').remove()
    })

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
    })

    // Add drag behavior
    node.call(d3.drag()
      .on('start', (event, d: any) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d: any) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d: any) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      }) as any
    )

  }, [currentSkills, skillsToLearn, targetRoleSkills])

  const stats = {
    have: currentSkills.length,
    need: skillsToLearn.length,
    coverage: Math.round((currentSkills.length / (currentSkills.length + skillsToLearn.length)) * 100)
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Brain className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Skills Universe</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Interactive skill dependency map</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-600"></div>
            <span className="text-xs text-slate-600 dark:text-slate-400">You Have ({stats.have})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-600"></div>
            <span className="text-xs text-slate-600 dark:text-slate-400">Critical ({skillsToLearn.filter(s => s.priority === 'critical').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-600"></div>
            <span className="text-xs text-slate-600 dark:text-slate-400">To Learn ({stats.need})</span>
          </div>
        </div>
      </div>

      <div className="mb-4 bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Skill Coverage</span>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{stats.coverage}%</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000"
            style={{ width: `${stats.coverage}%` }}
          ></div>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
          You have {stats.have} of {stats.have + stats.need} skills for your target role
        </p>
      </div>

      <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950/20">
        <svg ref={svgRef} className="w-full h-auto"></svg>
      </div>

      <div className="mt-4 text-xs text-slate-600 dark:text-slate-400 text-center">
        💡 Hover over skills to see details • Drag to rearrange • Bigger circles = higher priority
      </div>
    </div>
  )
}
