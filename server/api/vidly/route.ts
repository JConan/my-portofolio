import { Router } from "express"
import { Connection } from "mongoose"
import ControllerMovies from "@:api.vidly/controller"
import { MovieDoc } from "@:api.vidly/models"

interface IResourceMovie {
  id: string
  title: string
  genre: string
  rate?: number
  stock?: number
}

const mappingMovieResources = (m: MovieDoc): IResourceMovie => ({
  id: String(m._id),
  title: m.title,
  genre: m.genres.map((genre) => genre.name).join(","),
  rate: m.averageRate,
  stock: m.stock,
})

export const RouteMovies = (connection: Connection): Router => {
  const route = Router()
  const controller = ControllerMovies(connection)
  route.get("/movies", async (req, res) => {
    const result: Array<IResourceMovie> = (await controller.getMovies()).map(mappingMovieResources)
    res.send(result)
  })

  route.get("/movies/:id", async (req, res) => {
    const id = req.params.id
    const data = await controller.getMovie(id)
    if (data !== null) {
      res.send(mappingMovieResources(data))
    } else {
      res.sendStatus(404)
    }
  })
  return route
}
