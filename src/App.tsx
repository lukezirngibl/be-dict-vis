import React from 'react'
import styled from 'styled-components'

const mapToHex = (a: number): Record<string, string> => ({
  A: `rgba(236, 186, 175, ${a})`,
  T: `rgba(185, 217, 239, ${a})`,
  C: `rgba(243, 233, 166, ${a})`,
  G: `rgba(181, 216, 206, ${a})`,
})

const complement: Record<string, string> = {
  A: 'G',
  C: 'T',
  G: 'A',
  T: 'C',
}

const BORDER = 'rgba(0,0,0,0.1)'

const InputWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 32px;
  position: relative;

  label {
    margin-right: 8px;
    font-size: 14px;
  }

  div {
    padding: 16px;
    border: 1px solid rgba(0, 0, 0, 0.2);

    &:last-child {
      border-left-width: 0;
    }
  }
`

const Results = styled.div`
  display: flex;
  flex-direction: column;
  padding: 32px;
  align-items: center;
  width: 100%;
`

const Table = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  margin: 16px 0;
  border-right: 1px solid ${BORDER};
  border-left: 1px solid ${BORDER};
  width: 640px;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${BORDER};

  &:first-child {
    border-top: 1px solid ${BORDER};
  }
`

const Item = styled.div`
  width: 32px;
  border-right: 1px solid ${BORDER};
  display: flex;
  align-items: center;
  justify-content: center;

  &:last-child {
    border-right-width: 0;
  }
`

const Title = styled.p`
  padding: 8px;
  font-size: 13px;
  width: 100%;
  opacity: 0.8;
  font-style: italic;
`

const ClearResults = styled.p`
  position: absolute;
  top: 96px;
  right: 0;
  text-decoration: underline;
  cursor: pointer;
  font-size: 12px;
`

function App() {
  const [loci, setLoci] = React.useState<Array<{ id: string; locus: string }>>(
    [],
  )
  const [probs, setProbs] = React.useState<
    Array<{ id: string; probability: number; index: number }>
  >([])

  const readFile = async (file: any) => {
    const reader = file.stream().getReader()
    const l = await reader.read()
    const csv = new TextDecoder('utf-8').decode(l.value)
    return csv
      .trim()
      .split('\n')
      .map((r) => r.split(','))
  }

  const parseParsePredctions = async (file: any) => {
    const array = await readFile(file)

    let t: Array<{ id: string; probability: number; index: number }> = []
    for (let i = 1; i < array.length; i++) {
      t = [
        ...t,
        {
          id: array[i][1],
          index: Number(array[i][2]),
          probability: Number(array[i][5]),
        },
      ]
    }
    setProbs(t)
  }

  const parseParseOutput = async (file: any) => {
    const array = await readFile(file)

    let t: Array<{ id: string; locus: string }> = []
    for (let i = 1; i < array.length; i++) {
      t = [
        ...t,
        {
          id: array[i][22],
          locus: array[i][23],
        },
      ]
    }
    setLoci(t)
  }

  const renderTables = () => {
    return (
      <Results>
        {loci.map((locus) => {
          const items = probs.filter((p) => p.id === locus.id)
          return (
            <Table key={locus.id}>
              <Row style={{ width: '100%' }}>
                <Title>
                  {locus.id}: {locus.locus}
                </Title>
              </Row>
              <Row>
                {locus.locus.split('').map((c, k) => (
                  <Item key={k} style={{ height: 36 }}>
                    <p style={{ fontSize: 12, opacity: 0.7 }}>{k + 1}</p>
                  </Item>
                ))}
              </Row>
              <Row>
                {locus.locus.split('').map((c, k) => (
                  <Item
                    key={k}
                    style={{ height: 48, backgroundColor: mapToHex(1)[c] }}
                  >
                    <p style={{ fontSize: 14, fontWeight: 'bold' }}>{c}</p>
                  </Item>
                ))}
              </Row>
              <Row>
                {locus.locus.split('').map((c, k) => {
                  const p = items.find((i) => i.index === k)
                  return (
                    <Item
                      key={k}
                      style={{
                        height: 48,
                        backgroundColor: p
                          ? mapToHex(p.probability * 0.9 + 0.1)[complement[c]]
                          : 'none',
                      }}
                    >
                      <p style={{ fontSize: 12, fontWeight: 'bold' }}>
                        {p ? `${(p.probability * 100).toFixed(1)}` : ''}
                      </p>
                    </Item>
                  )
                })}
              </Row>
            </Table>
          )
        })}
      </Results>
    )
  }

  const showResults = loci.length > 0 && probs.length > 0

  return (
    <div className="App">
      <InputWrapper>
        <div>
          <label htmlFor="predictions">Upload predictions</label>
          <input
            type="file"
            id="predictions"
            name="predictions"
            accept=".csv"
            onChange={(e) => {
              if (e.target.files) {
                parseParsePredctions(e.target.files[0])
              }
            }}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <label htmlFor="predictions">Upload output</label>
          <input
            type="file"
            id="ouput"
            name="ouput"
            accept=".csv"
            onChange={(e) => {
              if (e.target.files) {
                parseParseOutput(e.target.files[0])
              }
            }}
          />
          {showResults && (
            <ClearResults
              onClick={() => {
                setLoci([])
                setProbs([])
              }}
            >
              Clear Results
            </ClearResults>
          )}
        </div>
      </InputWrapper>

      {showResults && renderTables()}
    </div>
  )
}

export default App
