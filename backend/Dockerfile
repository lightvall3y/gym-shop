# Build context: ./backend
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY src/GymShop.Api/GymShop.Api.csproj src/GymShop.Api/
RUN dotnet restore src/GymShop.Api/GymShop.Api.csproj
COPY src/GymShop.Api src/GymShop.Api
RUN dotnet publish src/GymShop.Api/GymShop.Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
USER $APP_UID
ENTRYPOINT ["dotnet", "GymShop.Api.dll"]
