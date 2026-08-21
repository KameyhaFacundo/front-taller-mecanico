import { Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import StorefrontIcon from '@mui/icons-material/Storefront'
import { listTalleresSuperadmin } from '../../services/superadminApi'
import { useAsyncData } from '../../hooks/useAsyncData'
import PageHeader from '../../components/PageHeader'
import SkeletonTable from '../../components/SkeletonTable'
import EmptyState from '../../components/EmptyState'
import { fmtDate } from '../../utils/format'

export default function SuperadminTalleres() {
  const talleres = useAsyncData(listTalleresSuperadmin, { errorMessage: 'No se pudieron cargar los talleres.' })
  const rows = talleres.data ?? []

  return (
    <>
      <PageHeader title="Talleres registrados" subtitle="Todos los talleres dados de alta en la plataforma." />

      {talleres.loading ? (
        <SkeletonTable columns={5} />
      ) : rows.length === 0 ? (
        <EmptyState icon={StorefrontIcon} title="Todavía no hay talleres" description="Cuando alguien se registre desde /registro va a aparecer acá." />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Taller</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell align="right">Usuarios</TableCell>
                <TableCell align="right">Clientes</TableCell>
                <TableCell align="right">Alta</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((taller) => (
                <TableRow key={taller.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {taller.nombre}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={taller.slug} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right">{taller.usuarios_count}</TableCell>
                  <TableCell align="right">{taller.clientes_count}</TableCell>
                  <TableCell align="right">{fmtDate(taller.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  )
}
