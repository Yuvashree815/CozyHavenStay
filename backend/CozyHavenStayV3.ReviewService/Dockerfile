FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 7104

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["CozyHavenStayV3.ReviewService/CozyHavenStayV3.ReviewService.csproj", "CozyHavenStayV3.ReviewService/"]
RUN dotnet restore "CozyHavenStayV3.ReviewService/CozyHavenStayV3.ReviewService.csproj"
COPY . .
WORKDIR "/src/CozyHavenStayV3.ReviewService"
RUN dotnet build "CozyHavenStayV3.ReviewService.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "CozyHavenStayV3.ReviewService.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CozyHavenStayV3.ReviewService.dll"]