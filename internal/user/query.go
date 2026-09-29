package user

import (
	"fmt"
	"net/http"
	"strconv"
)

func ParseUserListQuery(r *http.Request) (UserListParams, error) {
	query := r.URL.Query()

	page := 1
	if value := query.Get("page"); value != "" {
		parsed, err := strconv.Atoi(value)
		if err != nil {
			return UserListParams{}, fmt.Errorf("invalid page")
		}

		page = parsed
	}

	limit := 20
	if value := query.Get("limit"); value != "" {
		parsed, err := strconv.Atoi(value)
		if err != nil {
			return UserListParams{}, fmt.Errorf("invalid limit")
		}

		limit = parsed
	}

	sortBy := query.Get("sortBy")
	if sortBy == "" {
		sortBy = "created_at"
	}

	sortOrder := query.Get("sortOrder")
	if sortOrder == "" {
		sortOrder = "desc"
	}

	return UserListParams{
		Page:      page,
		Limit:     limit,
		Search:    query.Get("search"),
		SortBy:    sortBy,
		SortOrder: sortOrder,
	}, nil
}
