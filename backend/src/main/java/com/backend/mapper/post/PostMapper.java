package com.backend.mapper.post;

import com.backend.domain.place.Place;
import com.backend.domain.post.Banner;
import com.backend.domain.post.Post;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.Map;

@Mapper
public interface PostMapper {

    // 게시글 추가 | 작성 매퍼
    @Insert("""
            INSERT INTO post (title, content, memberid)
            VALUES (#{title}, #{content}, #{memberId})
            """)
    @Options(useGeneratedKeys = true, keyProperty = "postId")
    int insertPost(Post post);

    // 게시글 조회 매퍼
    @Select("""
                        SELECT p.postid,p.title,p.content,p.createdate,p.view,p.memberid,p.mdpick,
                               m.nickname, r.processYn,r.reportReason,
                               COUNT(DISTINCT c.commentid) commentCount,
                               COUNT(DISTINCT l.memberid)  likeCount
                        FROM post p
                                 JOIN member m ON p.memberid = m.memberid
                                 LEFT JOIN comment c ON p.postid = c.postid
                                 LEFT JOIN likes l ON p.postid = l.postid
            LEFT JOIN (
                SELECT r1.*
                FROM report r1
                         INNER JOIN (
                    SELECT postid, MAX(reportid) AS max_reportid
                    FROM report
                    GROUP BY postid
                ) r2 ON r1.postid = r2.postid AND r1.reportid = r2.max_reportid
            ) r ON p.postid = r.postid
                        WHERE p.postid = #{postId}
            """)
    Post selectByPostId(Integer postId);

    // 게시글 목록 매퍼 감차2
    @Select("""
            <script>
            SELECT p.postid, p.title, p.content, p.createdate, p.view,
                   m.nickname, m.memberid,
                   pl.addresscode,
                   (SELECT plpic.picurl
                      FROM placepic plpic
                      WHERE plpic.placeid = pl.placeid
                      ORDER BY plpic.placeid ASC
                      LIMIT 1) AS picurl,
                   r.processYn,r.reportReason,
                   COUNT(DISTINCT c.commentid) commentCount,
                   COUNT(DISTINCT l.memberid) likeCount,
                   (6371 * acos(cos(radians(#{latitude})) * cos(radians(pl.latitude)) * cos(radians(pl.longitude) - radians(#{longitude})) + sin(radians(#{latitude})) * sin(radians(pl.latitude)))) distance
            FROM post p JOIN member m ON p.memberid = m.memberid
                        JOIN authority a ON p.memberid = a.memberid
                        LEFT JOIN comment c ON p.postid = c.postid
                        LEFT JOIN likes l ON p.postid = l.postid
                        LEFT JOIN place pl ON p.postid = pl.postid
                        LEFT JOIN (
                            SELECT r1.*
                            FROM report r1
                                     INNER JOIN (
                                SELECT postid, MAX(reportid) AS max_reportid
                                FROM report
                                GROUP BY postid
                        ) r2 ON r1.postid = r2.postid AND r1.reportid = r2.max_reportid
                    ) r ON p.postid = r.postid
            <where>
                a.authtype != 'admin'
                <if test="searchType != null">
                    <bind name="pattern" value="'%' + searchKeyword + '%'"/>
                    <bind name="region" value="'%' + searchReg + '%'"/>
                    <if test="searchType == 'all'">
                        AND (p.title LIKE #{pattern}
                            OR p.content LIKE #{pattern}
                            OR m.nickname LIKE #{pattern}
                            OR pl.address LIKE #{pattern}
                            OR pl.placename LIKE #{pattern})
                    </if>
                    <if test="searchType == 'titleAndContent'">
                        AND (p.title LIKE #{pattern} OR p.content LIKE #{pattern})
                    </if>
                    <if test="searchType == 'nickName'">
                        AND m.nickname LIKE #{pattern}
                    </if>
                    <if test="searchType == 'placeName'">
                        AND (OR pl.placename LIKE #{pattern})
                    </if>
                    <if test="searchType == 'address'">
                        AND (pl.address LIKE #{pattern})
                    </if>
                    <if test="searchType == 'all'">
                        AND (pl.addresscode LIKE #{region})
                    </if>
                </if>
            </where>
            GROUP BY p.postid
            <choose>
                <when test="listSlider == 'closely'">
                    ORDER BY distance ASC, p.postid DESC
                </when>
                <when test="listSlider == 'recently'">
                    ORDER BY p.postid DESC
                </when>
                <otherwise>
                    ORDER BY p.postid DESC
                </otherwise>
            </choose>
            LIMIT #{offset}, 5
            </script>
            """)
    List<Post> selectAllPost(Integer offset, String listSlider, String searchType, String searchKeyword, String searchReg,
                             Double latitude, Double longitude);

    // 게시글 목록 카운트 매퍼
    @Select("""
            <script>
            SELECT COUNT(DISTINCT p.postid)
            FROM post p JOIN member m ON p.memberid = m.memberid
                        JOIN authority a ON p.memberid = a.memberid
                        LEFT JOIN place pl ON p.postid = pl.postid
                <where>
               a.authtype != 'admin'
                       <if test="searchType != null">
                       <bind name="pattern" value="'%' + searchKeyword + '%'"/>
                       <bind name="region" value="'%' + searchReg + '%'"/>
                        <if test="searchType == 'all'">
                            AND (p.title LIKE #{pattern} 
                                OR p.content LIKE #{pattern} 
                                OR m.nickname LIKE #{pattern} 
                                OR pl.address LIKE #{pattern} 
                                OR pl.placename LIKE #{pattern})
                        </if>
                        <if test="searchType == 'titleAndContent'">
                            AND (p.title LIKE #{pattern} OR p.content LIKE #{pattern})
                        </if>
                        <if test="searchType == 'nickName'">
                            AND m.nickname LIKE #{pattern}
                        </if>
                        <if test="searchType == 'placeName'">
                            AND (pl.address LIKE #{pattern} OR pl.placename LIKE #{pattern})
                        </if>
                        <if test="searchType == 'address'">
                            AND (pl.address LIKE #{pattern} OR pl.address LIKE #{pattern})
                        </if>
                        <if test="searchType == 'all'">
                            AND (pl.addresscode LIKE #{region})
                        </if>
                   </if>
                   </where>
            </script>
            """)
    Integer countAllpost(String searchType, String listSlider, String searchKeyword, String searchReg,
                         @Param("latitude") Double latitude, @Param("longitude") Double longitude);

    // 게시글 Top 3 인기글 목록 매퍼 감차
    @Select("""
                 SELECT p.postid, p.title, p.content, p.view, p.createDate,
                        m.nickName,
                        (SELECT plpic.picurl
                         FROM placepic plpic
                         WHERE plpic.placeid = pl.placeid
                         ORDER BY plpic.placeid ASC
                         LIMIT 1) AS picurl,
                        m.memberId,
            r.processYn,
                        COUNT(DISTINCT c.commentid) commentCount,
                        COUNT(DISTINCT l.memberid) likeCount,
                        ROW_NUMBER() OVER (ORDER BY likeCount DESC, p.view DESC, commentCount DESC) postOfBest
                 FROM post p
                          JOIN member m ON p.memberid = m.memberid
                          LEFT JOIN comment c ON p.postid = c.postid
                          LEFT JOIN likes l ON p.postid = l.postid
                          LEFT JOIN place pl ON p.postid = pl.postid
             LEFT JOIN (
                   SELECT r1.*
                   FROM report r1
                            INNER JOIN (
                       SELECT postid, MAX(reportid) AS max_reportid
                       FROM report
                       GROUP BY postid
                   ) r2 ON r1.postid = r2.postid AND r1.reportid = r2.max_reportid
               ) r ON p.postid = r.postid
                 GROUP BY p.postid, p.title, p.view, m.nickName, p.content
                 LIMIT 3
               """)
    List<Post> selectPostOfBest();

    // 게시글에서 선택한 장소 목록 매퍼
    @Select("""
            SELECT p.postid,
                   pl.placename,
                   pl.address,
                   pl.addresscode,
                   pl.placeurl,
                   pl.latitude,
                   pl.longitude,
                   plpic.picurl,
                   (SELECT COUNT(pl_inner.postid)
                    FROM place pl_inner
                    WHERE pl_inner.placeurl = pl.placeurl) countPlace
            FROM post p
                     JOIN place pl ON p.postid = pl.postid
                     LEFT JOIN placepic plpic ON pl.placename = plpic.placename
            WHERE p.postid = #{postId}
            order by pl.placeIndex;
            """)
    List<Place> selectPlaceList(Integer postId);

    // 게시글 작성 시 선택한 장소 카운트 매퍼
    @Select("""
            SELECT p.postid,
                   (SELECT COUNT(pl_inner.postid)
                    FROM place pl_inner
                    WHERE pl_inner.placeurl = pl.placeurl) countPlace
            FROM post p
                     JOIN place pl ON p.postid = pl.postid
            """)
    List<Place> selectPlaceListData(String selectPlaces);

    // 게시글 삭제 매퍼
    @Delete("""
            DELETE FROM post
            WHERE postid=#{postId}
            """)
    Integer deleteById(Integer postId);

    // 게시글 수정 매퍼
    @Update("""
            UPDATE post
            SET title=#{title}, content=#{content}
            WHERE postid=#{postId}
            """)
    void updatePost(Post post);

    // 좋아요 추가 매퍼
    @Insert("""
            INSERT INTO likes (postid, memberid)
            VALUES (#{postId}, #{memberId})
            """)
    int insertLike(Integer postId, Integer memberId);

    // 좋아요 삭제 매퍼
    @Delete("""
            DELETE FROM likes
            WHERE postid=#{postId} AND memberid=#{memberId}
            """)
    int deleteLike(Integer postId, Integer memberId);

    // 게시글 별 좋아요 개수 카운트 매퍼
    @Select("""
            SELECT COUNT(*)
            FROM likes
            WHERE postid=#{postId}
            """)
    Object countLikeByBoardId(Integer postId);

    // 회원 별 좋아요 개수 카운트 매퍼
    @Select("""
            select COUNT(*) from likes
            where postid=#{postId}
            and memberid=#{memberId}
            """)
    int selectLikeByPostIdAndMemberId(Integer postId, String memberId);

    // 게시글 별 댓글 개수 카운트 매퍼
    @Select("""
            SELECT COUNT(*)
            FROM comment
            WHERE postid = #{postId}
            """)
    int selectCountCommentByBoardId(Integer postId);

    // 조회수 매퍼
    @Update("""
            UPDATE post
            SET view=view+1
            WHERE postid=#{postId}
            """)
    int incrementViewCount(Integer postId);

    //MD List
    @Select("""
            <script>
            SELECT p.postid, p.title, p.content, p.createdate, p.view, p.mdpick,
                   m.nickname,
                   plpic.picurl,
                   COUNT(DISTINCT c.commentid) commentCount,
                   COUNT(DISTINCT l.memberid) likeCount
            FROM post p JOIN member m ON p.memberid = m.memberid
                        JOIN authority a ON p.memberid = a.memberid
                        LEFT JOIN comment c ON p.postid = c.postid
                        LEFT JOIN likes l ON p.postid = l.postid
                        LEFT JOIN place pl ON p.postid = pl.postid
                        LEFT JOIN placepic plpic ON pl.placeid = plpic.placeid
            <where>
            a.authtype = 'admin'
                 <if test="searchType != null">
                    <bind name="pattern" value="'%' + searchKeyword + '%'"/>
                    <if test="searchType == 'all'">
                        AND (p.title LIKE #{pattern} OR p.content LIKE #{pattern} OR m.nickname LIKE #{pattern} OR pl.address LIKE #{pattern} OR pl.placename LIKE #{pattern})
                    </if>
                    <if test="searchType == 'titleAndContent'">
                        AND (p.title LIKE #{pattern} OR p.content LIKE #{pattern})
                    </if>
                    <if test="searchType == 'nickName'">
                        AND m.nickname LIKE #{pattern}
                    </if>
                    <if test="searchType == 'placeName'">
                        AND (pl.address LIKE #{pattern} OR pl.placename LIKE #{pattern})
                    </if>
                    <if test="searchType == 'address'">
                        AND (pl.address LIKE #{pattern} OR pl.address LIKE #{pattern})
                    </if>
                </if>
            </where>
            GROUP BY p.postid
            ORDER BY p.postid DESC
            </script>
            """)
    List<Post> selectMdPostList(Map<String, Object> post, String searchType, String searchKeyword);

    //좋아요 리스트
    @Select("""
            <script>
            SELECT p.postid, p.title, p.content, p.createdate, p.view,
                   m.nickname, m.memberid,
                   plpic.picurl,
                   COUNT(DISTINCT c.commentid) commentCount,
                   COUNT(DISTINCT l2.memberid) likeCount
            FROM post p JOIN member m ON p.memberid = m.memberid
                        JOIN likes l ON p.postid = l.postid
                        LEFT JOIN comment c ON p.postid = c.postid
                        LEFT JOIN likes l2 ON p.postid = l2.postid
                        LEFT JOIN place pl ON p.postid = pl.postid
                        LEFT JOIN placepic plpic ON pl.placeid = plpic.placeid
            <where>
               l.memberid = #{memberId}
               <if test="searchType != null">
                    <bind name="pattern" value="'%' + searchKeyword + '%'"/>
                    <if test="searchType == 'all'">
                        AND (p.title LIKE #{pattern} OR p.content LIKE #{pattern} OR m.nickname LIKE #{pattern} OR pl.address LIKE #{pattern} OR pl.placename LIKE #{pattern})
                    </if>
                    <if test="searchType == 'titleAndContent'">
                        AND (p.title LIKE #{pattern} OR p.content LIKE #{pattern})
                    </if>
                    <if test="searchType == 'nickName'">
                        AND m.nickname LIKE #{pattern}
                    </if>
                    <if test="searchType == 'placeName'">
                        AND (pl.address LIKE #{pattern} OR pl.placename LIKE #{pattern})
                    </if>
                    <if test="searchType == 'address'">
                        AND (pl.address LIKE #{pattern} OR pl.address LIKE #{pattern})
                    </if>
                </if>
            </where>
            GROUP BY p.postid
            ORDER BY p.postid DESC
            LIMIT #{offset}, 5
                   </script>
            """)
    List<Post> selectLikeList(Integer memberId, Integer offset, String searchType, String searchKeyword);

    //좋아요 리스트 카운트
    @Select("""
            <script>
            SELECT COUNT(DISTINCT p.postid)
            FROM post p JOIN member m ON p.memberid = m.memberid
                               JOIN likes l ON p.postid = l.postid
                                   LEFT  JOIN  place pl ON p.postid = pl.postid
            <where>
                l.memberid = #{memberId}
                <if test="searchType != null">
                    <bind name="pattern" value="'%' + searchKeyword + '%'"/>
                    <if test="searchType == 'all'">
                        AND (p.title LIKE #{pattern} OR p.content LIKE #{pattern} OR m.nickname LIKE #{pattern}  OR pl.address LIKE #{pattern} OR pl.placename LIKE #{pattern})
                    </if>
                    <if test="searchType == 'titleAndContent'">
                        AND (p.title LIKE #{pattern} OR p.content LIKE #{pattern})
                    </if>
                    <if test="searchType == 'nickName'">
                        AND m.nickname LIKE #{pattern}
                    </if>
                    <if test="searchType == 'placeName'">
                        AND (pl.address LIKE #{pattern} OR pl.placename LIKE #{pattern})
                    </if>
                    <if test="searchType == 'address'">
                        AND (pl.address LIKE #{pattern} OR pl.address LIKE #{pattern})
                    </if>
                </if>
            </where>
            </script>
            """)
    Integer countAllLikePost(Integer memberId, String searchType, String searchKeyword);

    @Update("""
            UPDATE post
            SET mdpick = 'o'
            WHERE postid = #{postId}
                """)
    int updateMdPickPush(Integer postId);

    // 내가 작성한 글 가져오기 (작성한 글마다 좋아요 개수까지)
    @Select("""
            SELECT p.postid,
                   p.title,
                   p.content,
                   p.createdate,
                   p.view,
                   COUNT(l.postid) AS likeCount
            FROM post p
                     LEFT JOIN likes l ON p.postid = l.postid
            WHERE p.memberid = #{memberId}
            GROUP BY p.postid, p.title, p.content, p.createdate, p.view
            LIMIT #{offset}, 5
            """)
    List<Post> getMyList(Integer memberId, Integer offset);

    @Select("""
                        SELECT p.postid,
                                           p.title,
                                           p.content,
                                           p.createdate,
                                           p.view,
                                           p.banner,
                                           m.memberid,
                                           COUNT(DISTINCT c.commentid) commentCount,
                                           COUNT(DISTINCT l.memberid)  likeCount,
                                            p.mdpick
                                    FROM post p
                                             JOIN member m ON p.memberid = m.memberid
                                             JOIN authority a ON p.memberid = a.memberid
                                             LEFT JOIN comment c ON p.postid = c.postid
                                             LEFT JOIN likes l ON p.postid = l.postid
                                    WHERE a.authtype = 'admin' AND
                                          p.mdpick = 'o'
                        GROUP BY p.postid, p.title, p.content, p.createdate, p.view, m.memberid
                        ORDER BY p.postid DESC
            """)
    List<Post> selectMdPickPostList();

    @Select("""
            SELECT mdpick
            FROM post
            WHERE postid = #{postId}
                    """)
    String selectMdPickByPostId(Integer postId);

    @Update("""
            UPDATE post
            SET mdpick = 'x'
            WHERE postid = #{postId}
                """)
    int mdPickPop(Integer postId);

    // mdPick 된 게시물 개수
    @Select("""
            SELECT COUNT(mdpick)
            FROM post
            WHERE mdpick = 'o';
            """)
    int countMdPick();


    @Update("""
            UPDATE post
            set banner = #{key}
            where postid = #{postid}
            """)
    int updateBannerByPostId(Integer postid, String key);


    @Insert("""
            INSERT INTO placebanner (city,link, bannersrc)
            values (#{city},#{link}, #{bannersrc})
            """)
    void insertBanner(String city, String link, String bannersrc);


    @Select("""
            SELECT * FROM placebanner
            """)
    List<Banner> selectBannerList();


    @Delete("""
            DELETE FROM placebanner
            WHERE bannerid = #{bannerId}
            """)
    int deleteBannerById(Integer bannerId);


    @Select("""
            SELECT * FROM placebanner
            where bannerid = #{bannerId}
            """)
    Banner selectBannerSrcById(Integer bannerId);


    @Select("""
            SELECT banner FROM post
            where postid = #{postId}
            """)
    String getMdBannerNameByPostId(Integer postId);


    @Select("""
            SELECT a.authtype
            from authority a join post p on p.memberid = a.memberid
            where p.postid = #{postId}
            """)
    String selectAuthByPostId(Integer postId);

    // 회원 정보 화면에 해당 회원의 게시물과 누른 좋아요 갯수를 위한 sql 문
    @Select("""
            SELECT p.postid,
                   p.title,
                   p.content,
                   p.createdate,
                   p.view,
                   COUNT(l.postid) AS likeCount
            FROM post p
                     LEFT JOIN likes l ON p.postid = l.postid
            WHERE p.memberid = #{memberId}
            GROUP BY p.postid, p.title, p.content, p.createdate, p.view
            """)
    List<Post> getMyListCount(Integer memberId);
}