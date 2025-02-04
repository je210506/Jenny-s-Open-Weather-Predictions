import dayjs, { type Dayjs } from "dayjs";
import dotenv from "dotenv";
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state: string;
}

// TODO: Define a class for the Weather object
class Weather {
  city: string;
  date: Dayjs | string;
  tempF: number;
  windSpeed: number;
  humidity: number;
  icon: string;
  iconDescription: string;
  constructor(
    city: string,
    date: Dayjs | string,
    tempF: number,
    windSpeed: number,
    humidity: number,
    icon: string,
    iconDescription: string
  ) {
    this.city = city;
    this.date = date;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
    this.icon = icon;
    this.iconDescription = iconDescription;
  }
}

// TODO: Complete the WeatherService class
class WeatherService {
  //private baseURL?: string;

  private apiKey?: string;

  private city = "";

  constructor() {
    //this.baseURL = process.env.API_BASE_URL || "";

    this.apiKey = process.env.API_KEY || "";
  }
  // * Note: The following methods are here as a guide, but you are welcome to provide your own solution.
  // * Just keep in mind the getWeatherForCity method is being called in your
  // * 09-Servers-and-APIs/02-Challenge/Develop/server/src/routes/api/weatherRoutes.ts file

  // * the array of Weather objects you are returning ultimately goes to
  // * 09-Servers-and-APIs/02-Challenge/Develop/client/src/main.ts

  // TODO: Create fetchLocationData method
  // private async fetchLocationData(query: string) {
  //   //try catch, if no response, return error message
  //   const APIKey = "db24c959309b59398c79f23f076964e8";
  //   const response = await fetch(
  //     `http://api.openweathermap.org/data/2.5/forecast?q=${query}&appid=${APIKey}`
  //   );
  //   const data = await response.json();
  //   console.log(data);
  //   return this.destructureLocationData(data);
  // }
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    if (!locationData) {
      throw new Error("City Not found!");
    }
    //console.log(locationData)
    return { lat: locationData.lat, lon: locationData.lon , name:locationData.name, country: locationData.country, state: locationData.state};
  }
  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string { 
    // const stateCode = this.stateCode;
    // const countryCode = "";
    // const limit = "";
    return `https://api.openweathermap.org/geo/1.0/direct?q=${this.city}&limit=1&appid=${this.apiKey}`;
  }
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    //console.log(coordinates);
    return `http://api.openweathermap.org/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&appid=${this.apiKey}`;
  }
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(): Promise<Coordinates> {
    const response = await fetch(this.buildGeocodeQuery());
    const data = await response.json();
    //console.log(data);
    return this.destructureLocationData(data[0]);
  }
  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    //console.log(coordinates);
    const response = await fetch(this.buildWeatherQuery(coordinates));
    const data = await response.json();
    //console.log(data);
    return data;
  }
  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any): Weather {
    //console.log("I am response", response);
    const weatherObj = response.list[0];
    console.log("I am weatherObj", weatherObj);
    const date = dayjs.unix(weatherObj.dt);
    return new Weather(
      this.city,
      date,
      weatherObj.main.temp,
      weatherObj.wind.speed,
      weatherObj.main.humidity,
      weatherObj.weather[0].icon,
      weatherObj.weather[0].description
    );
  };
  // TODO: Complete buildForecastArray method
  private buildForecastArray(weatherData: any[]): Weather[] {
  const forecastArray: Weather[] = [];
    for (const data of weatherData) {
      const weather = data.weather[0];
      const date = dayjs.unix(data.dt);

      //console.log(weatherData);
      forecastArray.push( 
      new Weather (
        this.city,
        date,
        data.main.temp,
        data.wind.speed,
        data.main.humidity,
        weather.icon,
        weather.description,
        )
        // this.temp,
        // data.wind.speed,
        // weather.main.humidity,
        // weather.weather[0].icon,
        // weather.weather[0].description
      );
    }
    console.log(forecastArray);
    return forecastArray;
    
  };
  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    this.city = city;
    const coordinates = await this.fetchAndDestructureLocationData();
    const weatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecastArray = this.buildForecastArray(weatherData.list);
    return [currentWeather, ...forecastArray];
    //return [currentWeather, ...forecastArray];
    //bring back 153 when i bring back 148

  }
}

export default new WeatherService();
