"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLoader,
  IconPlus,
  IconClock,
  IconX,
} from "@tabler/icons-react"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export const schema = z.object({
  id: z.number(),
  name: z.string(),
  phoneNumber: z.string(),
  numberOfPeople: z.number(),
  typeOfSeat: z.string(),
  time: z.string(),
  status: z.string(),
})

// Drag handle
function DragHandle({ id }) {
  const { attributes, listeners } = useSortable({ id })
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent/15">
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

// Edit Drawer Component
function EditDrawer({ item, trigger }) {
  const isMobile = useIsMobile()
  const [formData, setFormData] = React.useState(item)
  const [open, setOpen] = React.useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
      loading: `Saving reservation for ${item.name}`,
      success: "Changes saved successfully",
      error: "Failed to save changes",
    })
    setOpen(false)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Drawer direction={isMobile ? "bottom" : "right"} open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {trigger}
      </DrawerTrigger>
      <DrawerContent className="max-h-[96vh] sm:max-w-lg bg-[#021226] border-[#031936]">
        <DrawerHeader className="gap-1 border-b border-[#031936]">
          <DrawerTitle className="text-white">{item.name}</DrawerTitle>
          <DrawerDescription className="text-white/70">
            Edit reservation details
          </DrawerDescription>
        </DrawerHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 overflow-y-auto">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/90">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="bg-transparent border-[#031936] text-white/70 focus:border-white/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-white/90">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                className="bg-transparent border-[#031936] text-white/70 focus:border-white/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfPeople" className="text-white/90">Number of People</Label>
              <Input
                id="numberOfPeople"
                type="number"
                value={formData.numberOfPeople}
                onChange={(e) => handleChange('numberOfPeople', parseInt(e.target.value))}
                className="bg-transparent border-[#031936] text-white/70 focus:border-white/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="typeOfSeat" className="text-white/90">Type of Seat</Label>
              <Select 
                value={formData.typeOfSeat} 
                onValueChange={(value) => handleChange('typeOfSeat', value)}
              >
                <SelectTrigger id="typeOfSeat" className="bg-transparent border-[#031936] text-white/70">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#021226] border-[#031936]">
                  <SelectItem value="Indoor" className="text-white/70 focus:bg-white/5">Indoor</SelectItem>
                  <SelectItem value="Outdoor" className="text-white/70 focus:bg-white/5">Outdoor</SelectItem>
                  <SelectItem value="VIP" className="text-white/70 focus:bg-white/5">VIP</SelectItem>
                  <SelectItem value="Bar" className="text-white/70 focus:bg-white/5">Bar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-white/90">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleChange('time', e.target.value)}
                className="bg-transparent border-[#031936] text-white/70 focus:border-white/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-white/90">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger id="status" className="bg-transparent border-[#031936] text-white/70">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#021226] border-[#031936]">
                  <SelectItem value="Accepted" className="text-white/70 focus:bg-white/5">Accepted</SelectItem>
                  <SelectItem value="Pending" className="text-white/70 focus:bg-white/5">Pending</SelectItem>
                  <SelectItem value="Declined" className="text-white/70 focus:bg-white/5">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DrawerFooter className="px-0 pt-4">
            <Button type="submit" className="w-full bg-white/10 hover:bg-white/15 text-white border border-[#031936]">
              Save Changes
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full bg-transparent hover:bg-white/5 text-white/70 border-[#031936]">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

const columns = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <EditDrawer 
        item={row.original} 
        trigger={
          <Button variant="link" className="text-white hover:bg-white/5 transition px-0 text-left">
            {row.original.name}
          </Button>
        }
      />
    ),
    enableHiding: false,
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
    cell: ({ row }) => (
      <span className="text-white/70">{row.original.phoneNumber}</span>
    ),
  },
  {
    accessorKey: "numberOfPeople",
    header: "Number of People",
    cell: ({ row }) => (
      <Badge variant="" className="text-white/70 !bg-[#D9D9D9]/1 outline outline-[#031936] px-2">
        {row.original.numberOfPeople} {row.original.numberOfPeople === 1 ? 'person' : 'people'}
      </Badge>
    ),
  },
  {
    accessorKey: "typeOfSeat",
    header: "Type of Seat",
    cell: ({ row }) => (
      <Badge variant="" className="text-white/70 !bg-[#D9D9D9]/1 outline outline-[#031936] px-2">
        {row.original.typeOfSeat}
      </Badge>
    ),
  },
  {
    accessorKey: "time",
    header: "Time",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-white/70">
        <IconClock className="w-4 h-4" />
        {row.original.time}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const statusColors = {
        Accepted: "text-green-400 fill-green-500",
        Pending: "text-amber-400 fill-amber-500",
        Declined: "text-red-400 fill-red-500"
      };
      
      return (
        <Badge variant="" className={`text-white/70 !bg-[#D9D9D9]/1 outline outline-[#031936] px-2 ${statusColors[status]}`}>
          {status === "Accepted" && <IconCircleCheckFilled className="fill-green-500 w-4 h-4" />}
          {status === "Pending" && <IconLoader className="w-4 h-4" />}
          {status === "Declined" && <IconX className="w-4 h-4" />}
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted !text-white flex size-8 hover:bg-white/5 transition"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32 bg-[#021226] border-[#031936]">
          <EditDrawer 
            item={row.original}
            trigger={
              <DropdownMenuItem 
                onSelect={(e) => e.preventDefault()}
                className="text-white/70 focus:bg-white/5 cursor-pointer"
              >
                Edit
              </DropdownMenuItem>
            }
          />
          <DropdownMenuItem className="text-white/70 focus:bg-white/5">Make a copy</DropdownMenuItem>
          <DropdownMenuItem className="text-white/70 focus:bg-white/5">Favorite</DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#031936]" />
          <DropdownMenuItem className="text-red-400 focus:bg-red-500/10">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

function DraggableRow({ row }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative border-b border-[#021226] hover:bg-white/5 transition"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} className="!text-white">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({ data: initialData }) {
  const [data, setData] = React.useState(() => initialData)
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [columnFilters, setColumnFilters] = React.useState([])
  const [sorting, setSorting] = React.useState([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  )

  const dataIds = React.useMemo(() => data?.map(({ id }) => id) || [], [data])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <Tabs defaultValue="outline" className="w-full flex-col justify-start gap-6">
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border border-[#021226]">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="!bg-[#021226] sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="border-b border-[#021226]"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className="text-white font-medium hover:bg-white/5 transition-colors"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody className="!text-white">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-white"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
      </TabsContent>
    </Tabs>
  )
}