import { useEffect, useRef, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import 'primereact/resources/themes/lara-light-indigo/theme.css'
import 'primereact/resources/primereact.css'
import 'primeicons/primeicons.css'
import { Button, FormGroup, Input, Label } from 'reactstrap'
import { Plus } from 'react-feather'
import { Menu } from 'primereact/menu'
import axios from 'axios'

const ListTable = props => {
  const {
    visibleColumns = [],
    moduleName = '',
    selectionMode,
    defaultCol,
    onBlankWidth = null,
    rowClassFn = null,
    tableListData,
    ...restProps
  } = props
  let { tableData = [] } = props
  const [menuItems, setMenuItems] = useState([])
  const [allColumns, setAllColumns] = useState([])
  const [columns, setColumns] = useState(visibleColumns)
  const [isShow, setIsShow] = useState(false)
  const table_current = useRef(null)
  const menuLeft = useRef(null)

  const getCurrentTable = async () => {
    const table = table_current?.current?.children[0]?.children[0]?.children[0]

    return table
  }

  const getScrollWidth = async () => {
    const table = await getCurrentTable()
    let scrollWidth = 500
    if (table) {
      scrollWidth = table.scrollWidth
    }
    return scrollWidth
  }
  const setScrollWidth = async width => {
    const table = await getCurrentTable()
    if (table) {
      if (!width) {
        width = await getScrollWidth()
      }
      table.style.width = `${width}px`
      table.style['min-width'] = '100%'
    }
  }

  useEffect(() => {
    const updateTableData = async () => {
      if (tableListData) {
        setAllColumns(tableListData?.columns)
        await setScrollWidth(tableListData?.scrollWidth)
      }
    }
    updateTableData()
  }, [tableListData, moduleName])

  const columnManagement = () => {
    return (
      <>
        <Button
          className="columnManagement"
          color={'primary'}
          onClick={event => menuLeft.current.toggle(event)}
        >
          <Plus size={15} />
        </Button>
        <Menu model={menuItems} popup ref={menuLeft} id="popup_menu_left" />
      </>
    )
  }
  const updateColumns = async columnsObject => {
    const scrollWidth = await getScrollWidth()

    await axios.put(`${process.env.REACT_APP_API_URL}/user/update-columns/${moduleName}`, {
      scrollWidth,
      columns: columnsObject,
    })
  }
  const changeColumnVisibility = async (id, visible) => {
    try {
      const items = []
      setAllColumns(prev => {
        let defaultColVal = defaultCol
        if (!defaultColVal) {
          defaultColVal = prev[0]['id']
        }
        let count_visible = 0
        prev.map(c => {
          if (c.id === id) {
            c.visible = visible
          }
          if (c.visible) {
            count_visible++
          }
        })
        prev.map(c => {
          if (c.id === id) {
            c.visible = visible
          }

          if (count_visible <= 0 && defaultColVal === c.id) {
            c.visible = true
          }

          items.push({
            template: (item, options) => (
              <FormGroup check inline>
                <Input
                  type="checkbox"
                  id={c.name + c.id}
                  value={c.id}
                  checked={c.visible}
                  onChange={e => {
                    changeColumnVisibility(c.id, e.target.checked)
                  }}
                />
                <Label for={c.name + c.id} check>
                  {c.name}
                </Label>
              </FormGroup>
            ),
          })
          columns.map(vc => {
            if (vc.default === true) {
            } else if (c.id === vc.id) {
              vc.visible = c.visible
            }
          })
        })
        return prev
      })

      setMenuItems(items)
      await updateColumns(allColumns)
      if (onBlankWidth) {
        onBlankWidth()
      }
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    if (allColumns && columns && allColumns.length && columns.length) {
      const items = []
      allColumns.map(col => {
        items.push({
          template: (item, options) => (
            <FormGroup check inline>
              <Input
                type="checkbox"
                id={col.name + col.id}
                value={col.id}
                checked={col.visible}
                onChange={e => {
                  changeColumnVisibility(col.id, e.target.checked)
                }}
              />
              <Label for={col.name + col.id} check style={{ userSelect: 'none' }}>
                {col.name}
              </Label>
            </FormGroup>
          ),
        })

        columns?.map(vc => {
          if (vc.default === true) {
          } else if (col.id === vc.id) {
            vc.visible = col.visible
          }
        })
      })
      setMenuItems(items)
    }
    return () => {}
  }, [allColumns, columns])

  useEffect(() => {
    if (allColumns && columns && allColumns.length && columns.length) {
      const rearrangedColumns = []
      for (let order = 0; order < allColumns.length; order++) {
        const coldData = allColumns[order]
        const colId = coldData['id']
        if (colId === null) {
        } else {
          const column = columns.find(col => col.id === colId)
          if (column) {
            const colData = { ...column, ...coldData }
            if (colData?.style) {
              if (colData.style?.width) {
              }
            }
            rearrangedColumns.push(colData)
          }
        }
      }
      setColumns(rearrangedColumns)
    }
    return () => {}
  }, [allColumns])

  useEffect(() => {
    const fetchColumns = async () => {
      try {
        if (moduleName) {
          if (moduleName !== 'email-template' && !tableListData) {
            const res = await axios.get(
              `${process.env.REACT_APP_API_URL}/user/list-columns/${moduleName}`
            )
            // Handle single-object result (e.g. { success, result: { columns, scrollWidth, moduleName } })
            const result = res?.data?.result
            const savedColumns = result?.columns && Array.isArray(result.columns) ? result.columns : null
            setAllColumns(savedColumns || visibleColumns || [])
            const scrollWidthVal = result?.scrollWidth
            await setScrollWidth(
              scrollWidthVal === null || scrollWidthVal === undefined ? undefined : scrollWidthVal
            )
          }

          if (onBlankWidth) {
            onBlankWidth()
          }
        }
      } catch (err) {
        // Only handle response errors, let global interceptor handle network errors
        if (err && err.response) {
          console.log('Failed to fetch columns:', err.response.data?.message || err.message)
        }
      }
    }
    fetchColumns()
  }, [moduleName])

  let startSerialNumber = restProps.first
  tableData = tableData.map(data => {
    return {
      ...data,
      SNumber: ++startSerialNumber,
    }
  })

  const selectAllCheckboxes = document.querySelectorAll('.p-column-header-content')
  selectAllCheckboxes.forEach(elementAllCheckBox => {
    const componentToRemove = elementAllCheckBox.querySelector('.p-checkbox')
    if (componentToRemove) {
      elementAllCheckBox.removeChild(componentToRemove)
    }
  })
  const onColReorderFn = async e => {
    const coldOrder1 = e.columns.map(column => column.props)

    const coldOrder = e.columns.map(column => column.props.field)
    const rearrangedColumns = []
    for (let order = 0; order < coldOrder.length; order++) {
      const colId = coldOrder[order]
      if (colId === null) {
      } else {
        const column = allColumns && allColumns.find(col => col.id === colId)
        if (column) {
          rearrangedColumns.push({ ...column, order })
        }
      }
    }
    setAllColumns(rearrangedColumns)
    await updateColumns(rearrangedColumns)
    if (onBlankWidth) {
      onBlankWidth()
    }
  }
  const onColumnResizerClickFn = async e => {}

  const onColumnResizeEndFn = async e => {
    const colId = e.column.props.field
    const rearrangedColumns = []
    for (let order = 0; order < allColumns.length; order++) {
      const column = allColumns[order]
      if (colId === column.id) {
        const style = column?.style || {}
        let width = 0
        if (style.width) {
          width = parseFloat(style.width)
        }
        if (!width) {
          width = 0
        }
        style.maxwidth = `${width + e.delta}px`
        style.width = `${width + e.delta}px`

        rearrangedColumns.push({ ...column, style })
      } else {
        rearrangedColumns.push(column)
      }
    }

    setAllColumns(rearrangedColumns)
    await updateColumns(rearrangedColumns)
    if (onBlankWidth) {
      onBlankWidth()
    }
  }

  const rowClass = data => {
    if (rowClassFn) {
      return rowClassFn(data)
    }
    return {}
  }

  return (
    <>
      <div className="table_current" ref={table_current}>
        <DataTable
          {...{
            rowClassName: rowClass,
            onColReorder: onColReorderFn,
            onColumnResizeEnd: onColumnResizeEndFn,
            onColumnResizerClick: onColumnResizerClickFn,
            lazy: true,
            first: 0,
            size: 'small',
            value: tableData,
            paginator: true,
            resizableColumns: true,
            showGridlines: true,
            reorderableColumns: true,
            rowsPerPageOptions: [7, 10, 25, 50, 75, 100],
            rows: 7,
            paginatorTemplate:
              'RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink',
            currentPageReportTemplate: 'Showing {first} to {last} of {totalRecords} entries',
            selectionMode: 'checkbox',
            emptyMessage: 'No records found.',
            columnResizeMode: 'expand',
            hideOverlaysOnDocumentScrolling: false,
            ...restProps,
          }}
        >
          <Column
            sortable={false}
            reorderable={false}
            resizeable={false}
            key="columnKey"
            align="center"
            className="column_fixed"
            header={columnManagement}
            body={row => (row['SNumber'] ? row['SNumber'] : '-')}
            selectionMode={selectionMode ? 'multiple' : null}
          ></Column>
          {columns &&
            columns?.length > 0 &&
            columns.map(col => (
              <Column
                key={col.id}
                {...{
                  sortable: col.sortable,
                  reorderable: col.reorder,
                  field: col.id,
                  header: col.name,
                  body: col?.cell,
                  hidden: !(col?.visible === undefined || col?.visible === true),
                  style: col?.style,
                }}
              />
            ))}
        </DataTable>
      </div>
    </>
  )
}

export default ListTable
