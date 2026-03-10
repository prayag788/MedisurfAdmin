const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8005/api'

const getToken = () => {
  const tokenRaw =
    localStorage.getItem('accessToken') || localStorage.getItem('authToken')

  if (!tokenRaw) {
    return null
  }

  let token = tokenRaw

  try {
    const parsed = JSON.parse(tokenRaw)
    if (typeof parsed === 'object' && parsed !== null) {
      token = parsed.token || parsed.accessToken || tokenRaw
    }
  } catch (_) {
    token = tokenRaw
  }

  return token && typeof token === 'string' ? token.trim() : null
}

export const getAllWorkSheet = async (id) => {
  const token = getToken()
  const resp = await fetch(`${BASE_URL}/orthanc/study/getAllWorkSheet/${id}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  })
  const data = await resp.json()
  const { status, worksheets } = data
  console.log('ppp worksheet .. ', status, worksheets)
  if (status && worksheets?.length > 0) {
    return worksheets
  } else {
    return []
  }
}

export const uploadWorksheet = async (data, id) => {
  const token = getToken()
  const dataArr = []
  await Object.values(data).map((item) => {
    dataArr.push(item)
  })

  let respData

  if (dataArr.length > 0) {
    const formdata = new FormData()
    formdata.append('worksheet', data[0])
    formdata.append('id', id)
    respData = await fetch(`${BASE_URL}/orthanc/study/assignWorkSheet`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      body: formdata,
    })
  }

  return respData
}

export const deleteWorksheet = async (studyId, worksheetId) => {
  const token = getToken()
  const res = await fetch(
    `${BASE_URL}/orthanc/study/deleteWorkSheet/${studyId}/${worksheetId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    }
  )
  return res
}

export const getAllDicomImage = async (studyId, options = {}) => {
  console.log(
    '[getAllDicomImage] Called with studyId:',
    studyId,
    'options:',
    options
  )
  try {
    const token = getToken()
    let url = `${BASE_URL}/orthanc/getStudyImages/${studyId}`

    const params = new URLSearchParams()
    if (options.page) params.append('page', options.page)
    if (options.limit) params.append('limit', options.limit)
    if (options.seriesId) params.append('seriesId', options.seriesId)
    if (typeof options.includeAll !== 'undefined') {
      params.append('includeAll', options.includeAll ? 'true' : 'false')
    }
    if ([...params.keys()].length > 0) {
      url += `?${params.toString()}`
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    const res = await fetch(url, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      signal: options.signal || controller.signal,
    })
    clearTimeout(timeoutId)

    const data = await res.json()
    console.log('[getAllDicomImage] Response:', data)
    return { data }
  } catch (error) {
    console.error('[getAllDicomImage] Error:', error)

    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again')
    } else if (error instanceof TypeError) {
      throw new Error('Network Error - Please check your internet connection')
    }

    throw error
  }
}

const normalizeSeriesId = (series) => {
  return series.seriesId || series.sreiesId || null
}

const transformSeriesOption = (series) => {
  const seriesId = normalizeSeriesId(series)
  if (!seriesId) return null

  return {
    value: String(seriesId),
    name: `${series.modality || 'Unknown'} - ${series.instanceCount || 0} images`,
    modality: series.modality,
    instanceCount: series.instanceCount,
    seriesId: String(seriesId),
  }
}

export const getAllSeries = async (studyId) => {
  try {
    console.log('[getAllSeries] Fetching series for studyId:', studyId)
    const token = getToken()
    const res = await fetch(
      `${BASE_URL}/explorer/studies/${studyId}/series-data`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await res.json()
    console.log('[getAllSeries] API response:', data)

    if (
      data.success &&
      Array.isArray(data.seriesOptions) &&
      data.seriesOptions.length > 0
    ) {
      const transformed = data.seriesOptions
        .map(transformSeriesOption)
        .filter(Boolean)

      console.log('[getAllSeries] Transformed series:', {
        count: transformed.length,
        series: transformed.map((s) => ({
          value: s.value,
          modality: s.modality,
          instanceCount: s.instanceCount,
        })),
      })

      return {
        data: {
          all_series: transformed,
        },
      }
    }

    console.warn('[getAllSeries] No valid seriesOptions in response:', {
      success: data.success,
      seriesOptionsCount: Array.isArray(data.seriesOptions)
        ? data.seriesOptions.length
        : 'N/A',
      data,
    })
    return { data: { all_series: [] } }
  } catch (error) {
    console.error('[getAllSeries] Error:', error)
    return { data: { all_series: [] } }
  }
}

export const getDiagnosis = async () => {
  const token = getToken()
  const res = await fetch(`${BASE_URL}/diagnosis/all-templates`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  })
  const data = await res.json()
  return { data }
}

export const getTemplates = async () => {
  const token = getToken()
  const res = await fetch(`${BASE_URL}/report-template/all-templates`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  })
  const data = await res.json()
  return { data }
}
