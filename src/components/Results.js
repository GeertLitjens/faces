import React from 'react'
import { format } from 'd3-format'

import Message from './Message'

const fmt = (x, digits = 1) => format(`.${digits}%`)(x)

const Summary = ({ total, cancer }) => (
  <Message bg="yellow">
    <strong>Results:</strong><strong>{total}</strong>{' '}
    {total > 1 ? 'plaatjes' : 'plaatje'} geclassficeerd,{' '}
    <strong>
      {cancer} ({fmt(cancer / total, 0)})
    </strong>{' '}
    {cancer === 1 ? 'bevat er ' : 'bevatten er '} kankercellen.    
  </Message>
)

const Results = ({ patches, classifications }) => (
  <div>
    <Summary
      total={patches.length}
      cancer={classifications.filter(r => r.label === "Cancer").length}
    />
    <div className="flex flex-wrap mxn1 mt1">
      {patches.map((patch, i) => (
        <div key={i} className="col col-4 sm-col-3 md-col-5th px1">
          <div className="mb1 border border-silver rounded overflow-hidden">
            <img
              src={patch.src}
              alt={`patch ${i + 1}`}
              className="block col-12"
            />
            <div className="p05 fs-tiny">
              {classifications.map(({ label, value }) => (
                <div key={i} className="flex justify-between">
                  <div className="mr05 truncate">
                    {label}
                  </div>
                  <div className="bold">{fmt(value)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default Results
